import { generateObject, generateText, ToolSet } from 'ai';
import { createGuiAgentTool } from 'tools/guiAgentTool';
import { humanLayerTool } from 'tools/humanLayerTool';
import { terminalAgentTool } from 'tools/terminalAgentTool';
import { z } from 'zod';
import { ExecuteInput, FileMetadata } from './types/agent.types';
import { DEFAULT_CONFIG } from '@app/shared/constants';

import { anthropic } from '@ai-sdk/anthropic';
import { ScreenshotDto } from '@app/shared/dto';
import { Conversation } from '@ui-tars/shared/types';
import { Operator } from '@app/packages/ui-tars-sdk';
import { excelTool } from 'tools/excelTool';

export class ReactAgent {
    operator: Operator;
    tools: ToolSet;
    memory = [];
    private screenshots: ScreenshotDto[] = []; // Add screenshots array
    private files: FileMetadata[] = []; // Array to store file metadata for tool usage

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
                },
                // Capture screenshots only from the GUI agent
                onScreenshot: (base64, conversation) => {
                    this.captureScreenshot(base64, conversation);
                }
            }),
            humanLayerTool,
            terminalAgentTool,
            excelTool
        };

        console.log('Available tools:', Object.keys(this.tools));
    }
    
    /**
     * Captures a screenshot with the associated conversation
     * @param base64 Base64 encoded screenshot
     * @param conversation The entire conversation object
     */
    private captureScreenshot(base64: string, conversation: Conversation): void {
        this.screenshots.push({
            base64,
            conversation,
            timestamp: Date.now()
        });
    }
    
    /**
     * Gets all captured screenshots
     * @returns Array of screenshots with associated thoughts
     */
    public getScreenshots(): ScreenshotDto[] {
        return this.screenshots;
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
            model: anthropic('claude-3-5-haiku-latest'),
            messages: [
                {
                    role: 'system',
                    content: `Given the current state shown in the screenshot and the user's request, create a high-level plan with a MAXIMUM OF THREE STEPS to accomplish the task. Return a JSON object with format {"plan": ["step1", "step2", "step3"]}.

                    <memory>
                    ${this.memory.length > 0 ? this.memory.join("\n") : "No previous actions."}
                    </memory>

                    ${this.files.length > 0 ? `
                    <available_files>
                    The following files are available for use with tools that accept file references:
                    ${this.files.map((file, index) => `${index + 1}. ${file.fileName} (ID: ${file.fileId}, Type: ${file.mimeType}, Size: ${Math.round(file.fileSize/1024)} KB)`).join('\n')}

                    These files can be used directly with tools like excelTool by providing the file ID in the 'excelId' parameter.
                    </available_files>
                    ` : ''}

                    Guidelines for creating effective steps:
                    1. Focus on high-level goals rather than individual actions
                    2. Consider all available tools: GUI interactions, terminal commands, and human assistance
                    3. Combine related operations into single, cohesive steps
                    4. Each step should represent a meaningful part of the overall task
                    5. Think of one step as something that can be accomplished using a single tool
                    6. Use memory content to inform your planning
                    7. For terminal operations, focus on the outcome rather than specific commands
                    8. For GUI tasks, describe the end goal rather than each click
                    9. When human input is needed, clearly specify what information to request
                    ${this.files.length > 0 ? '10. Consider how to utilize available files with tools that accept file IDs' : ''}
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
            model: anthropic('claude-3-5-haiku-latest'),
            schema: z.object({
                updatedPlan: z.array(z.string()).describe("Updated sequence of actions to take, with completed steps removed"),
                isEnd: z.boolean().describe("Has the final goal been reached"),
                changeSinceLastStep: z.string().describe("summary of everything that happened in last step.")
            }),
            messages: [
                {
                    role: 'system',
                    content: `You are a replanning agent that evaluates progress and updates the execution plan.

                    <memory>
                    ${this.memory.length > 0 ? this.memory.join("\n") : "No previous actions."}
                    </memory>

                    ${this.files.length > 0 ? `
                    <available_files>
                    The following files are available for use with tools that accept file references:
                    ${this.files.map((file, index) => `${index + 1}. ${file.fileName} (ID: ${file.fileId}, Type: ${file.mimeType}, Size: ${Math.round(file.fileSize/1024)} KB)`).join('\n')}

                    These files can be used directly with tools like excelTool by providing the file ID in the 'excelId' parameter.
                    </available_files>
                    ` : ''}

                    Guidelines:
                    1. Analyze the current plan, execution results, and any failed actions
                    2. Determine if the original approach needs adjustment based on results
                    3. IMPORTANT: Always limit the updated plan to a MAXIMUM OF THREE HIGH-LEVEL STEPS
                    4. Choose appropriate tools for each step:
                       - GUI interactions for visual interface tasks
                       - Terminal commands for system operations
                       - Human assistance when judgment or external input is needed
                       ${this.files.length > 0 ? '- File operations using appropriate tools with file IDs' : ''}
                    5. Summarize completed actions to maintain context
                    6. Consider the current screen state when planning next steps
                    7. For complex tasks, focus on outcomes rather than detailed steps
                    8. Be flexible in approach - if one tool isn't working, consider alternatives
                    9. Use memory to avoid repeating unsuccessful approaches`
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: "text",
                            text: `
                            <current_plan>${plan.join("\n")}</current_plan>
                            
                            <previous_execution_results>
${toolResults.map((result, index) => `Result ${index + 1}:\n${JSON.stringify(result, null, 2)}`).join('\n\n')}
</previous_execution_results>
                            
                            <failed_actions>
${failedActions.length > 0 ? failedActions.join("\n") : "No failed actions."}
</failed_actions>
                            
                            Based on the above information and the current screen, update the plan by removing completed steps and adjusting for any failures. If the final goal: "${userInput}" has been reached, set "isEnd" to true.
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
            isEnd: object.isEnd,
            changeSinceLastStep: object.changeSinceLastStep
        };
    }

    public async execute(params: ExecuteInput) {
        // Take screenshot with backoff
        const scrot = await this.takeScreenshotWithBackoff();
        const { maxSteps, input, files } = params;

        // Store file metadata if provided
        if (files && files.length > 0) {
            // Validate that each file has the required properties and cast to the correct type
            const validFiles = files
                .filter(file =>
                    file.fileId && file.fileName && file.mimeType && typeof file.fileSize === 'number'
                )
                .map(file => ({
                    fileId: file.fileId,
                    fileName: file.fileName,
                    originalName: file.originalName,
                    mimeType: file.mimeType,
                    fileSize: file.fileSize
                })) as FileMetadata[];

            if (validFiles.length !== files.length) {
                console.warn(`Some files were missing required properties. Using ${validFiles.length} of ${files.length} files.`);
            }

            this.files = validFiles;
            console.log(`ReactAgent received ${validFiles.length} valid files: ${validFiles.map(f => f.fileName).join(', ')}`);
        }

        // We no longer capture screenshots here - only from guiAgent

        let currentStep = 0;
        let plan = await this.getInitialPlan(input, scrot.base64);
        
        while(currentStep < maxSteps) {
            // Take screenshot outside the messages block
            const screenshot = await this.takeScreenshotWithBackoff();
            
            // We no longer capture screenshots here - only from guiAgent
            
            const {text, toolResults, steps} = await generateText({
                model: anthropic('claude-3-7-sonnet-20250219'),
                system: `Your goal is to determine the optimal tool and action for the current step in the plan. Based on the context and current state, select the most appropriate tool.

                <memory>
                ${this.memory.length > 0 ? this.memory.join("\n") : "No previous actions."}
                </memory>

                ${this.files.length > 0 ? `
                <available_files>
                The following files are available for use with tools that accept file references:
                ${this.files.map((file, index) => `${index + 1}. ${file.fileName} (ID: ${file.fileId}, Type: ${file.mimeType}, Size: ${Math.round(file.fileSize/1024)} KB)`).join('\n')}

                These files can be used directly with tools like excelTool by providing the file ID in the 'excelId' parameter.
                </available_files>
                ` : ''}

                Use memory to understand previous actions and their results. Focus on accomplishing the current step effectively rather than trying to complete the entire plan at once.

                ## Gui Specific instruction
                For actions involving click and type, you should prioritize the screenshot to decide your next action.
                `,
                maxSteps: 1,
                toolChoice: 'required',
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                "type": "text",
                                "text": `Given the tools available, the current plan, and the screenshot, determine the best tool and specific actions to complete the current step. If all steps have been completed, indicate this by not calling any tools.

                                <plan>${plan.join("\n")}</plan>
                                
                                When using the guiAgent tool, pass relevant context in the memory parameter. For terminal operations, use clear, specific commands.
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
            }).catch(error => {
                console.error('Error generating text:', error);
                return {
                    text: `UNHANDLED_ERROR: ${error}`,
                    toolResults: [error],
                    steps: []
                };
            });

            if(steps[0].toolCalls.length === 0 && text != 'UNHANDLED_ERROR') {
                console.log("No tool calls needed, finishing task...");
                break;
            }
            
            // We no longer capture screenshots here - only from guiAgent
                        
            const { updatedPlan, isEnd, changeSinceLastStep } = await this.checkAndReplan({
                userInput: input,
                plan,
                toolResults
            });

            // @ts-ignore
            this.memory.push(changeSinceLastStep);
            this.memory.push(`lastToolResult: ${JSON.stringify(steps[0].toolResults)}`)
            
            // We no longer capture screenshots here - only from guiAgent
            
            if(isEnd) {
                break;
            }
            
            plan = updatedPlan;
            
            // Update history with a summary to keep context size manageable
            if (this.memory.length >= 5) {
                this.memory = await this.summarize(this.memory, input);
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
                model: anthropic('claude-3-7-sonnet-20250219'),
                system: `You are a context-aware summarization agent. Your task is to create a concise summary of the provided interaction logs, preserving only the information critical for continuing the given task.
                Identify the task domain and focus on the most relevant elements:
                - Social media: Users, accounts, posts.
                - Development: Files, code patterns, errors.
                - Research: Sources, findings, search terms.
                - E-commerce: Products, filters, cart.
                - Navigation: Location, path, landmarks.
                - Files: When dealing with files, summary must contain the fileName, metadata, the last row read and structure of the file. This will never be removed from memory.`,
                messages: [
                    {
                        role: 'user',
                        content: `Task: ${input}

Interaction logs:
${memory.join('\n\n')}

Based on the task and the logs, provide a concise summary. Return ONLY the summary text.`
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