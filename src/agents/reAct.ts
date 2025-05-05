
import { groq } from '@ai-sdk/groq';
import { generateObject, generateText, Tool, ToolSet } from 'ai';
import { createGuiAgentTool } from 'tools/guiAgentTool';
import { humanInputTool } from 'tools/humanInputTool';
import { terminalAgentTool } from 'tools/terminalAgentTool';
import { z } from 'zod';
import { ExecuteInput } from './types/agent.types';
import { DEFAULT_CONFIG } from '@app/shared/constants';
import { Operator } from '@ui-tars/sdk/dist/core';

export class ReactAgent {
    operator: Operator;
    tools: ToolSet;
    constructor(operator: Operator) {
        this.operator = operator;   
        this.tools = {
            guiAgent: createGuiAgentTool({
                abortController: new AbortController(),
                operator: this.operator,
                timeout: 120000,
                config: {
                    "baseURL": DEFAULT_CONFIG.VLM_BASE_URL,
                    "apiKey": DEFAULT_CONFIG.VLM_API_KEY,
                    "model": DEFAULT_CONFIG.VLM_MODEL_NAME,
                }
            }),
            humanInputTool,
            terminalAgentTool
        };

        console.log('Available tools:', Object.keys(this.tools));
    }

    /**
     * Takes a screenshot with exponential backoff in case of failures
     * This helps when the page is in a navigation state
     */
    private async takeScreenshotWithBackoff(maxRetries = 3, initialDelay = 100): Promise<{base64: string}> {
        let retries = 0;
        let delay = initialDelay;
        
        while (retries < maxRetries) {
            try {
                const screenshot = await this.operator.screenshot();
                return screenshot;
            } catch (error) {
                console.warn(`Screenshot attempt ${retries + 1} failed: ${error.message}`);
                retries++;
                
                if (retries >= maxRetries) {
                    console.error("Max screenshot retries reached, throwing last error");
                    throw error;
                }
                
                // Exponential backoff with jitter
                const jitter = Math.random() * 200;
                await new Promise(resolve => setTimeout(resolve, delay + jitter));
                delay *= 2; // Exponential backoff
            }
        }
        
        // Fallback in case loop exits unexpectedly
        return await this.operator.screenshot();
    }

    public async getInitialPlan(userInput: string, base64: string) {
        const { text } = await generateText({
            tools: this.tools,
            toolChoice: 'none',
            model: groq('meta-llama/llama-4-scout-17b-16e-instruct'),
            messages: [
                {
                    role: 'system',
                    content: `Given the tools available and the current screen state using the screenshot, decompose user command into a MAXIMUM OF THREE STEPS that can be executed with the tools available. Return a JSON object with format {"plan": ["step1", "step2", "step3"]} where plan is an array of strings describing sequence of actions to take. 
                    
                    IMPORTANT: Limit the plan to a MAXIMUM OF THREE HIGH-LEVEL STEPS, but each step can contain multiple GUI sub-actions. For example, "Click search bar, type 'weather app', press Enter, and select first result" would be ONE step that contains multiple GUI sub-actions. Generate the plan without additional commentary.
                    
                    Here's an example:
                    
                    User command: "Search for 'weather app' on the app store and install the first result"
                    
                    Response:
                    {
                      "plan": [
                        "Open the App Store application using guiAgent",
                        "Search for 'weather app' by clicking search bar, typing 'weather app', pressing Enter, waiting for results to load, and clicking the first app in results",
                        "Install the app by clicking 'Get'/'Install' button, authenticate if prompted, and wait for installation to complete"
                      ]
                    }
                    
                    Notice how each step is clear, actionable, and groups related GUI actions together. ALWAYS LIMIT TO THREE OR FEWER STEPS.
                    `
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: "text",
                            text: userInput
                        }, 
                        {
                            type: "image",
                            image: base64,
                            mimeType: "image/png"
                        }
                    ]
                }
            ],
        });

        try {
            // Extract JSON from the text response
            const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || text;
            const { plan } = JSON.parse(jsonStr);
            return plan;
        } catch (error) {
            console.error('Failed to parse plan from text response:', error);
            // Fallback: If parsing fails, try to extract actions as lines
            const lines = text.split('\n').filter(line => line.trim().startsWith('-') || line.trim().match(/^\d+\./));
            return lines.map(line => line.replace(/^[-\d.\s]+/, '').trim());
        }
    }

    public async checkAndReplan({
        userInput,
        plan,
        toolResults,
        failedActions = []
    }: {
        plan: string[],
        history: string[],
        toolResults: any[],
        failedActions?: string[],
        userInput: string
    }) {
        // Take screenshot outside the messages block
        const screenshot = await this.takeScreenshotWithBackoff();
        
        const { object } = await generateObject({
            model: groq('meta-llama/llama-4-scout-17b-16e-instruct'),
            schema: z.object({
                updatedPlan: z.array(z.string()).describe("Updated sequence of actions to take, with completed steps removed"),
                summary: z.string().describe("Brief summary of what has been accomplished so far"),
                isEnd: z.boolean().describe("Has the final goal been reached")
            }),
            messages: [
                {
                    role: 'system',
                    content: `You are a replanning agent that evaluates execution progress and updates the plan.
                    
                    Guidelines:
                    1. Analyze the current plan, past tool results, and any failed actions
                    2. Modify the plan if any steps failed or if the current approach needs adjustment
                    3. IMPORTANT: Always limit the updated plan to a MAXIMUM OF THREE HIGH-LEVEL STEPS
                    4. Each guiStep can contain multiple sub GUI actions. A GUI action is any action that requires mouse and keyboard
                    5. Summarize what has been accomplished so far to keep context concise using the thoughts of previous agent
                    6. Never remove critical information from the summary
                    7. Consider both successful and failed actions when updating the plan
                    8. Combine related GUI actions into single steps to reduce the total number of steps`
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: "text",
                            text: `
                            <current_plan>${plan.join("\n")}</current_plan>
                            
                            Following is the thinking previous thinking process of the guiAgent
                            <previous_agents_thoughts>
${toolResults.map((result, index) => `Result ${index + 1}:\n${JSON.stringify(result, null, 2)}`).join('\n\n')}
</previous_agents_thoughts>
                            
                            <failed_actions>
${failedActions.length > 0 ? failedActions.join("\n") : "No failed actions."}
</failed_actions>
                            
                            Based on the above information, update the plan by removing completed steps and adjusting for any failures, then summarize progress. Following this is the screenshot of the screen. If final goal :"${userInput}" is reached set "isEnd" to true, 
                            `
                        },
                        {
                            "type": "image",
                            "image": screenshot.base64,
                            "mimeType": "image/png"
                        }
                    ]
                }
            ],
        });

        return {
            updatedPlan: object.updatedPlan,
            summary: object.summary,
            isEnd: object.isEnd
        };
    }

    public async execute(params: ExecuteInput) {
        // Take screenshot with backoff
        const scrot = await this.takeScreenshotWithBackoff();
        const { maxSteps, input } = params;
        
        let currentStep = 0;
        let plan = await this.getInitialPlan(input, scrot.base64);
        let history = [];
        
        while(currentStep < maxSteps) {
            // Take screenshot outside the messages block
            const screenshot = await this.takeScreenshotWithBackoff();
            
            const {text, toolResults} = await generateText({
                model: groq('meta-llama/llama-4-scout-17b-16e-instruct'),
                system: `Your goal is to tell me the next tool to call based on the user input, the screenshot and the tools available, the current step and the history of previous actions. Respond with tool calls needed or reply with empty tool call if the task is finished.`,
                maxSteps: 1,
                toolChoice: 'auto',
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                "type": "text",
                                "text": `Given the tools available and the screenshot, and the current step, give me the next tool to call or none to finish. 
                                

                                <history>${history.join("\n")}</history>
                                ---
                                <plan>${plan.join("\n")}</plan>
                                `
                            },
                            {
                                "type": "image",
                                "image": screenshot.base64,
                                "mimeType": "image/png"
                            }
                        ]
                    }
                ],
                tools: this.tools,
            });
                        
            const { updatedPlan, summary, isEnd } = await this.checkAndReplan({
                userInput: input,
                plan,
                history,
                toolResults
            });
            

            if(isEnd) {
                break;
            }
            plan = updatedPlan;
            
            // Update history with a summary to keep context size manageable
            if (history.length > 10) {
                history = [summary];
            }
            currentStep++;
            
        }
    }
}