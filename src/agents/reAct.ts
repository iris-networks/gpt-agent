
import { groq } from '@ai-sdk/groq';
import { generateObject, generateText, ToolSet } from 'ai';
import { createGuiAgentTool } from 'tools/guiAgentTool';
import { humanLayerTool } from 'tools/humanLayerTool';
import { terminalAgentTool } from 'tools/terminalAgentTool';
import { z } from 'zod';
import { ExecuteInput } from './types/agent.types';
import { DEFAULT_CONFIG } from '@app/shared/constants';
import { Operator } from '@ui-tars/sdk/dist/core';

export class ReactAgent {
    operator: Operator;
    tools: ToolSet;
    memory = []
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
            humanLayerTool,
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
                    content: `Given the current screen state in the screenshot, decompose the user command into a MAXIMUM OF THREE HIGH-LEVEL STEPS to accomplish the task. Return a JSON object with format {"plan": ["step1", "step2", "step3"]} where plan is an array of strings describing a sequence of actions to take.
                    
                    <memory>
                    ${this.memory.length > 0 ? this.memory.join("\n") : "No previous actions."}
                    </memory>
                    
                    Guidelines for creating effective steps:
                    1. Focus on higher-level goals rather than individual UI actions
                    2. Combine related actions into a single step when possible
                    3. For complex navigation tasks, describe the end goal rather than each click
                    4. When text input is needed, specify that content must be provided
                    5. Each step should represent a meaningful part of the overall task
                    6. Think of one step as something that can be done using one tool.
                    7. Use memory content to inform your planning and avoid repeating failed approaches.
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
                isEnd: z.boolean().describe("Has the final goal been reached")
            }),
            messages: [
                {
                    role: 'system',
                    content: `You are a replanning agent that evaluates execution progress and updates the plan.
                    
                    <memory>
                    ${this.memory.length > 0 ? this.memory.join("\n") : "No previous actions."}
                    </memory>
                    
                    Guidelines:
                    1. Analyze the current plan, past execution results, and any failed actions
                    2. Modify the plan if any steps failed or if the current approach needs adjustment
                    3. IMPORTANT: Always limit the updated plan to a MAXIMUM OF THREE HIGH-LEVEL STEPS
                    4. Create steps that focus on end goals rather than individual actions (each step will ideally contain everything that can be done by one tool at a time)
                    5. Summarize what has been accomplished so far to maintain context (you must always keep the names of users / posts you have interacted with in summary so you don't interact with them again!)
                    6. Consider the current screen state when planning next steps
                    7. For complex tasks, use single comprehensive instructions rather than multiple small steps
                    8. When text input is needed, ensure the step indicates that content should be provided
                    9. Use the memory content to inform your replanning and avoid repeating approaches that didn't work`
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: "text",
                            text: `
                            <current_plan>${plan.join("\n")}</current_plan>
                            
                            Following is the thinking previous thinking process of the previous agent
                            <previous_agents_thoughts>
${toolResults.map((result, index) => `Result ${index + 1}:\n${JSON.stringify(result, null, 2)}`).join('\n\n')}
</previous_agents_thoughts>
                            
                            <failed_actions>
${failedActions.length > 0 ? failedActions.join("\n") : "No failed actions."}
</failed_actions>
                            
                            Based on the above information, update the plan by removing completed steps and adjusting for any failuresFollowing this is the screenshot of the screen. If final goal :"${userInput}" is reached set "isEnd" to true, 
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
            isEnd: object.isEnd
        };
    }

    public async execute(params: ExecuteInput) {
        // Take screenshot with backoff
        const scrot = await this.takeScreenshotWithBackoff();
        const { maxSteps, input } = params;
        
        let currentStep = 0;
        let plan = await this.getInitialPlan(input, scrot.base64);
        
        while(currentStep < maxSteps) {
            // Take screenshot outside the messages block
            const screenshot = await this.takeScreenshotWithBackoff();
            
            const {text, toolResults, steps} = await generateText({
                model: groq('meta-llama/llama-4-scout-17b-16e-instruct'),
                system: `Your goal is to determine the next action to take based on the current plan, screenshot, and execution history. Choose the most appropriate tool for the current step, focusing on high-level objectives rather than individual UI interactions. Respond with tool calls needed or reply with empty tool call if the task is finished. The next step will ideally contain everything that can be done by one tool in succession.
                
                <memory>
                ${this.memory.length > 0 ? this.memory.join("\n") : "No previous actions."}
                </memory>
                
                Use the memory to understand what actions have already been taken and their results. This will help you make better decisions about what to do next and avoid repeating actions that didn't work.`,
                maxSteps: 1,
                toolChoice: 'required',
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                "type": "text",
                                "text": `Given the tools available and the screenshot, and the current step, give me the next tool to call or none to finish. 

                                <plan>${plan.join("\n")}</plan>
                                
                                When using the guiAgent tool, make sure to pass the memory parameter to maintain context between steps.
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

            if(steps[0].toolCalls.length === 0) {
                console.log("No tool calls needed, finishing task.......")
                break;
            }
                        
            const { updatedPlan, isEnd } = await this.checkAndReplan({
                userInput: input,
                plan,
                toolResults
            });


            // @ts-ignore
            this.memory.push(JSON.stringify(toolResults[0].result))
            
            if(isEnd) {
                break;
            }
            plan = updatedPlan;
            
            // Update history with a summary to keep context size manageable
            if (this.memory.length >= 5) {
                this.memory = await this.summarize(this.memory, input)
            }
            currentStep++;
        }
    }
    
    
    /**
     * Summarizes the agent's memory based on the nature of the task
     * @param memory Array of stringified tool results
     * @param input Original user instruction
     * @returns A condensed memory array with the summary
     */
    async summarize(memory: any[], input?: string): Promise<any[]> {
        if (memory.length === 0) return [];
        
        try {
            const { text } = await generateText({
                model: groq('meta-llama/llama-4-scout-17b-16e-instruct'),
                system: `You are a context-aware summarization agent that determines what information is important to preserve based on the task domain.
                
                For each specific domain, you identify different critical elements:
                - Social media: Users, accounts, posts interacted with
                - Development: Files created/modified, code patterns, error messages
                - Research: Sources, key findings, search terms, areas explored
                - E-commerce: Products viewed, filters applied, cart contents
                - Navigation: Current location, path history, landmarks
                
                Analyze the task and memory to determine what information is most valuable to preserve for future steps.`,
                messages: [
                    {
                        role: 'user',
                        content: `Task: ${input || "Perform operations efficiently"}
                        
                        Analyze these interaction logs and create a summary that preserves only what's needed for continuing this task.
                        Determine what type of task this is and what information would be most critical to maintain.
                        
                        Interaction logs:
                        ${memory.join('\n\n')}
                        `
                    }
                ]
            });
            
            return [text];
        } catch (error) {
            console.error('Failed to generate summary:', error);
            return memory.slice(-3);
        }
    }
}