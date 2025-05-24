import { generateObject, generateText, ToolSet } from 'ai';
import { createGuiAgentTool } from 'tools/guiAgentTool';
import { humanLayerTool } from 'tools/humanLayerTool';
import { terminalAgentTool } from 'tools/terminalAgentTool';
import { z } from 'zod';
import { ExecuteInput, FileMetadata, AgentStatusCallback, IAgent } from './types/agent.types';
import { DEFAULT_CONFIG } from '@app/shared/constants';

import { anthropic } from '@ai-sdk/anthropic';
import { ScreenshotDto } from '@app/shared/dto';
import { Conversation, StatusEnum } from '@ui-tars/shared/types';
import { Operator } from '@app/packages/ui-tars-sdk';
import { excelTool } from 'tools/excelTool';
import { codeTool } from 'tools/codeTool';
import { UITarsModelConfig } from '@app/packages/ui-tars-sdk/Model';

export class ReactAgent implements IAgent {
    operator: Operator;
    tools: ToolSet;
    agentStatusCallback?: AgentStatusCallback;
    memory = [];
    private screenshots: ScreenshotDto[] = []; // Add screenshots array
    private files: FileMetadata[] = []; // Array to store file metadata for tool usage

    constructor(operator: Operator, statusCallback?: AgentStatusCallback) {
        this.operator = operator;
        if (statusCallback) {
            this.agentStatusCallback = statusCallback;
        }

        this.tools = {
            guiAgent: createGuiAgentTool({
                abortController: new AbortController(),
                operator: this.operator,
                timeout: 120000,
                config: {
                    "baseURL": DEFAULT_CONFIG.VLM_BASE_URL,
                    "apiKey": DEFAULT_CONFIG.VLM_API_KEY,
                    "model": DEFAULT_CONFIG.VLM_MODEL_NAME,
                } as UITarsModelConfig,
                // Capture screenshots only from the GUI agent
                onScreenshot: (base64, conversation) => {
                    this.screenshots.push({
                        base64,
                        conversation,
                        timestamp: Date.now()
                    });
                }
            }),
            humanLayerTool,
            terminalAgentTool,
            excelTool,
            codeTool
        };

        console.log('Available tools:', Object.keys(this.tools));
    }

    /**
     * Set the status callback function
     */
    setStatusCallback(callback: AgentStatusCallback): void {
        this.agentStatusCallback = callback;
    }

    /**
     * Emit a status update to the frontend
     */
    private emitStatus(message: string, status: StatusEnum, data?: any): void {
        if (this.agentStatusCallback) {
            this.agentStatusCallback(message, status, data);
        } else {
            console.log(`[Agent Status] ${status}: ${message}`);
        }
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
        this.emitStatus("Generating initial plan", StatusEnum.RUNNING);

        try {
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

            this.emitStatus(text, StatusEnum.RUNNING);

            try {
                // Extract JSON from the text response
                const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || text;
                const { plan } = JSON.parse(jsonStr);

                // Emit status with the parsed plan
                this.emitStatus(`Plan created with ${plan.length} steps`, StatusEnum.RUNNING, { plan });

                return plan;
            } catch (error) {
                console.error('Failed to parse plan from text response:', error);
                // Fallback: If parsing fails, try to extract actions as lines
                const lines = text.split('\n').filter(line => line.trim().startsWith('-') || line.trim().match(/^\d+\./));
                const extractedPlan = lines.map(line => line.replace(/^[-\d.\s]+/, '').trim());

                // Emit status with the extracted plan
                this.emitStatus(`Plan extracted with ${extractedPlan.length} steps`, StatusEnum.RUNNING, { plan: extractedPlan });

                return extractedPlan;
            }
        } catch (error) {
            this.emitStatus(`Error generating plan: ${error.message}`, StatusEnum.ERROR);
            throw error;
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
        this.emitStatus(plan.join("\n"), StatusEnum.RUNNING);

        try {
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

            // Emit status based on the replanning results
            const status = object.isEnd ? StatusEnum.END : StatusEnum.RUNNING;
            this.emitStatus(
                object.changeSinceLastStep,
                status,
                {
                    updatedPlan: object.updatedPlan,
                    isEnd: object.isEnd,
                    summary: object.changeSinceLastStep
                }
            );

            return {
                updatedPlan: object.updatedPlan,
                isEnd: object.isEnd,
                changeSinceLastStep: object.changeSinceLastStep
            };
        } catch (error) {
            this.emitStatus(`Error during replanning: ${error.message}`, StatusEnum.ERROR);
            throw error;
        }
    }

    public async execute(params: ExecuteInput) {
        try {
            this.emitStatus("Starting execution", StatusEnum.RUNNING);

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
                this.emitStatus(`Loaded ${validFiles.length} files`, StatusEnum.RUNNING, {
                    files: validFiles.map(f => f.fileName).join(', ')
                });
            }

            // We no longer capture screenshots here - only from guiAgent
            this.emitStatus("Creating initial plan", StatusEnum.RUNNING);
            let currentStep = 0;
            let plan = await this.getInitialPlan(input, scrot.base64);

            while(currentStep < maxSteps) {
                this.emitStatus(`Executing step ${currentStep + 1} of max ${maxSteps}`, StatusEnum.RUNNING, {
                    currentStep: currentStep + 1,
                    maxSteps,
                    plan
                });

                // Take screenshot outside the messages block
                const screenshot = await this.takeScreenshotWithBackoff();

                // We no longer capture screenshots here - only from guiAgent

                this.emitStatus(`Determining action for step ${currentStep + 1}`, StatusEnum.RUNNING);
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
                    this.emitStatus(`Error generating text: ${error.message}`, StatusEnum.ERROR);
                    return {
                        text: `UNHANDLED_ERROR: ${error}`,
                        toolResults: [error],
                        steps: []
                    };
                });

                // Emit the text generated by the model
                this.emitStatus(text, StatusEnum.RUNNING);

                if(steps[0].toolCalls.length === 0 && text != 'UNHANDLED_ERROR') {
                    console.log("No tool calls needed, finishing task...");
                    break;
                }

                // Emit info about the tools being called
                if (steps[0].toolCalls.length > 0) {
                    const toolName = steps[0].toolCalls[0].name;
                    this.emitStatus(`Executing tool: ${toolName}`, StatusEnum.RUNNING, {
                        toolName,
                        toolParams: steps[0].toolCalls[0].parameters
                    });
                }

                // We no longer capture screenshots here - only from guiAgent

                this.emitStatus(JSON.stringify(toolResults[0], null, 2), StatusEnum.RUNNING);
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
                    this.emitStatus(text, StatusEnum.END);
                    break;
                }

                plan = updatedPlan;

                // Update history with a summary to keep context size manageable
                if (this.memory.length >= 10) {
                    this.emitStatus("Summarizing memory for better context", StatusEnum.RUNNING);
                    this.memory = await this.summarize(this.memory, input);
                }

                currentStep++;
            }

            if (currentStep >= maxSteps) {
                // Generate a final summary of findings when maximum steps are reached
                const summary = await this.generateFinalSummary(input, this.memory);

                this.emitStatus(summary, StatusEnum.MAX_LOOP, {
                    stepsExecuted: currentStep,
                    maxSteps
                });
            }
        } catch (error) {
            this.emitStatus(`Error during execution: ${error.message}`, StatusEnum.ERROR);
            throw error;
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
            this.emitStatus("Updating Agent Memory", StatusEnum.RUNNING);

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

            this.emitStatus("Agent memory updated", StatusEnum.RUNNING, {
                memorySummary: text
            });

            return [text];
        } catch (error) {
            console.error('Failed to generate summary:', error);
            this.emitStatus(`Failed to summarize memory: ${error.message}`, StatusEnum.ERROR);
            return memory.slice(-3);
        }
    }

    /**
     * Generates a comprehensive final summary when maximum steps are reached
     * @param input Original user instruction
     * @param memory Array of memory entries
     * @returns A comprehensive summary string
     */
    async generateFinalSummary(input: string, memory: any[]): Promise<string> {
        if (memory.length === 0) return "Maximum steps reached with no progress to report.";

        try {
            const { text } = await generateText({
                model: anthropic('claude-3-7-sonnet-20250219'),
                system: `You are a summarization agent tasked with creating a comprehensive final report. Your goal is to explain what was accomplished, what remains to be done, and any notable findings or challenges.

                The report should be structured, clear, and focus on:
                1. What was requested by the user
                2. What was accomplished so far (be specific about completed steps)
                3. What remains to be done
                4. Any roadblocks or challenges encountered
                5. Recommendations for next steps

                When dealing with files or data operations, include specific details about:
                - File names and structures
                - Data processed
                - Current state of operations

                The summary should be detailed enough to give a complete picture but concise enough to be actionable.`,
                messages: [
                    {
                        role: 'user',
                        content: `User task: ${input}

Memory entries:
${memory.join('\n\n')}

Create a comprehensive final summary of what was done, what was found, and what remains to be done. This summary will be displayed to the user as the final output since the maximum number of execution steps was reached.`
                    }
                ]
            });

            return text;
        } catch (error) {
            console.error('Failed to generate final summary:', error);
            return `Maximum steps reached. Progress summary generation failed: ${error.message}`;
        }
    }
}