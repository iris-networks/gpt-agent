
import { anthropic } from '@ai-sdk/anthropic';
import { Operator } from '@ui-tars/sdk/dist/types';
import { generateObject, generateText, Tool, ToolSet } from 'ai';
import { createGuiAgentTool } from 'tools/guiAgentTool';
import { humanInputTool } from 'tools/humanInputTool';
import { terminalAgentTool } from 'tools/terminalAgentTool';
import { z } from 'zod';
import { ExecuteInput, ExecuteInputSchema } from './types/agent.types';

export class ReactAgent {
    operator: Operator;
    tools: ToolSet;
    constructor(operator: Operator) {
        this.operator = operator;   
        this.tools = {
            guiAgent: createGuiAgentTool({
                abortController: new AbortController(),
                operator: this.operator,
                timeout: 120000
            }),
            humanInputTool,
            terminalAgentTool
        };

        console.log('Available tools:', Object.keys(this.tools));
    }

    public async getInitialPlan() {
        const { object: { plan } } = await generateObject({
            model: anthropic('claude-3-7-sonnet-20250219'),
            schema: z.object({
                plan: z.array(z.string()).describe("Sequnce of actions to take")
            }),
            messages: [
                {
                    role: 'system',
                    content: 'Given the tools available decompose user command into step by step plan, that can be executed with the help of tools available to us.'
                }
            ],
        });

        return plan;
    }

    public async checkAndReplan({
        plan,
        history,
        toolResults,
        failedActions = []
    }) {
        const { object: { updatedPlan, summary } } = await generateObject({
            model: anthropic('claude-3-7-sonnet-20250219'),
            schema: z.object({
                updatedPlan: z.array(z.string()).describe("Updated sequence of actions to take, with completed steps removed"),
                summary: z.string().max(200).describe("Brief summary of what has been accomplished so far")
            }),
            messages: [
                {
                    role: 'system',
                    content: `You are a planning agent that evaluates execution progress and updates the plan.
                    
                    Guidelines:
                    1. Analyze the current plan, history of actions, tool results, and any failed actions
                    2. Remove successfully completed steps from the plan
                    3. Modify the plan if any steps failed or if the current approach needs adjustment
                    4. Summarize what has been accomplished so far to keep context concise
                    5. Never remove critical information from the summary
                    6. Consider both successful and failed actions when updating the plan`
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: "text",
                            text: `
                            <current_plan>${plan.join("\n")}</current_plan>
                            
                            <action_history>${history.join("\n")}</action_history>
                            
                            <tool_results>${JSON.stringify(toolResults)}</tool_results>
                            
                            <failed_actions>${failedActions.join("\n")}</failed_actions>
                            
                            Based on the above information, update the plan by removing completed steps and adjusting for any failures, then summarize progress.
                            `
                        },
                        {
                            "type": "image",
                            "image": (await this.operator.screenshot()).base64,
                            "mimeType": "image/png"
                        }
                    ]
                }
            ],
        });

        return {
            updatedPlan,
            summary
        };
    }

    public async execute(params: ExecuteInput) {
        // Validate the input parameters
        const validatedParams = ExecuteInputSchema.parse(params);
        const { maxSteps, input } = validatedParams;
        
        let currentStep = 0;
        let plan = await this.getInitialPlan();
        let history = [];
        let toolResults = [];
        let failedActions = [];
        
        while(currentStep < maxSteps) {
            const {text, toolCalls} = await generateText({
                model: anthropic('claude-3-7-sonnet-20250219'),
                system: `Your goal is to tell me the next action based on the user input, the screenshot and the tools available, the current step and the history of previous actions. Respond with only the essential information needed to execute the next step.`,
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
                                "image": (await this.operator.screenshot()).base64,
                                "mimeType": "image/png"
                            }
                        ]
                    }
                ],
                tools: this.tools
            });

            // Track the current action for history
            const currentAction = text.trim();
            history.push(`Step ${currentStep + 1}: ${currentAction}`);
            
            // Execute tool calls and collect results
            let stepResults = [];
            let stepFailed = false;
            
            for await(let {toolName, toolCallId} of toolCalls) {
                try {
                    const tool = this.tools[toolName];
                    const result = await tool.execute(tool.parameters, {
                        "messages": [],
                        toolCallId
                    });
                    
                    // Store tool results for replanning context
                    stepResults.push({
                        toolName,
                        success: true,
                        result
                    });
                } catch (error) {
                    // Track failed actions
                    stepResults.push({
                        toolName,
                        success: false,
                        error: error.message
                    });
                    failedActions.push(`Failed at step ${currentStep + 1}: ${toolName} - ${error.message}`);
                    stepFailed = true;
                }
            }
            
            // Add step results to overall results
            toolResults.push({
                step: currentStep + 1,
                action: currentAction,
                results: stepResults
            });
            
            // Check if replanning is needed after each step, especially after failures
            if (stepFailed || currentStep > 0) {
                const { updatedPlan, summary } = await this.checkAndReplan({
                    plan,
                    history,
                    toolResults,
                    failedActions
                });
                
                plan = updatedPlan;
                
                // Update history with a summary to keep context size manageable
                if (history.length > 10) {
                    history = [`Summary of previous steps: ${summary}`, ...history.slice(-5)];
                }
            }
            
            currentStep++;
        }
    }
}