import { generateObject, generateText, ToolSet } from 'ai';
import { createGuiAgentTool } from 'tools/guiAgentTool';
import { humanLayerTool } from 'tools/humanLayerTool';
import { terminalAgentTool } from 'tools/terminalAgentTool';
import { z } from 'zod';
import { ExecuteInput, FileMetadata, AgentStatusCallback, IAgent } from './types/agent.types';
import { DEFAULT_CONFIG } from '@app/shared/constants';

import { anthropic } from '@ai-sdk/anthropic';
import { ScreenshotDto } from '@app/shared/dto';
import { excelTool } from 'tools/excelTool';
import { codeTool } from 'tools/codeTool';
import { Operator } from '@app/packages/ui-tars/sdk/src/types';
import { StatusEnum } from '@app/packages/ui-tars/shared/src/types';
import { UITarsModelConfig } from '@app/packages/ui-tars/sdk/src/Model';

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
                    "baseURL": process.env.VLM_BASE_URL,
                    "apiKey": process.env.VLM_API_KEY,
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

    public async execute(params: ExecuteInput) {
        try {
            this.emitStatus("Starting execution", StatusEnum.RUNNING);

            const { maxSteps, input, files } = params;

            // Store file metadata if provided
            if (files && files.length > 0) {
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

            let currentStep = 0;
            let isTaskComplete = false;

            // Main execution loop - everything happens here
            while (currentStep < maxSteps && !isTaskComplete) {
                this.emitStatus(`Executing step ${currentStep + 1} of max ${maxSteps}`, StatusEnum.RUNNING, {
                    currentStep: currentStep + 1,
                    maxSteps
                });

                // Take screenshot for current state analysis
                const screenshot = await this.takeScreenshotWithBackoff();

                // Single AI call that handles: planning, action selection, execution, and progress evaluation
                const { text, toolResults, steps } = await generateText({
                    model: anthropic("claude-3-5-haiku-latest"),
                    system: `You are an intelligent agent that can analyze the current state, determine the best action, and execute it in a single step.

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

                    Your process:
                    1. Analyze the current screenshot and understand the state
                    2. Consider the user's goal and what has been accomplished so far (from memory)
                    3. Determine if the task is complete - if so, respond without calling any tools
                    4. If not complete, choose the most appropriate tool and action to make progress
                    5. Focus on making meaningful progress toward the goal

                    Available tools:
                    - guiAgent: For web/GUI interactions (clicking, typing, navigating)
                    - terminalAgentTool: For command line operations
                    - humanLayerTool: When human input or decision is needed
                    - excelTool: For Excel file operations (use file IDs from available_files)
                    - codeTool: For code analysis and modifications

                    Guidelines:
                    - Make decisive actions that move toward the goal
                    - If you encounter errors, adapt your approach
                    - Use memory to avoid repeating failed attempts
                    - Be specific in your tool usage
                    - Consider the current state when deciding next actions
                    - If the task appears complete, explain why and don't call tools

                    ## GUI Specific Instructions
                    For actions involving click and type, prioritize the screenshot to decide your next action.
                    Pass relevant context in the memory parameter when using guiAgent.`,
                    maxSteps: 1,
                    toolChoice: 'auto', // Let the model decide if tools are needed
                    messages: [
                        {
                            role: 'user',
                            content: [
                                {
                                    type: "text",
                                    text: `User Goal: ${input}

                                    Analyze the current state and take the next most appropriate action to accomplish this goal. 
                                    
                                    If you believe the task is complete based on the current state and memory, explain why and don't call any tools.
                                    
                                    If you need to take action, choose the most appropriate tool and execute it with specific parameters.`
                                },
                                {
                                    type: "image",
                                    image: screenshot.base64,
                                    mimeType: "image/png"
                                }
                            ]
                        }
                    ],
                    tools: this.tools,
                }).catch(error => {
                    console.error('Error in execution step:', error);
                    this.emitStatus(`Error in execution step: ${error.message}`, StatusEnum.ERROR);
                    return {
                        text: `EXECUTION_ERROR: ${error.message}`,
                        toolResults: [],
                        steps: [{ toolCalls: [] }]
                    };
                });

                // Emit the agent's reasoning/response
                this.emitStatus(text, StatusEnum.RUNNING);

                // Check if no tools were called (task might be complete)
                if (steps[0].toolCalls.length === 0) {
                    // Use another AI call to verify if task is truly complete
                    const completionCheck = await this.checkTaskCompletion(input, screenshot.base64, text);
                    
                    if (completionCheck.isComplete) {
                        this.emitStatus(completionCheck.reason, StatusEnum.END);
                        isTaskComplete = true;
                        break;
                    } else {
                        // If not complete but no tools called, there might be an issue
                        this.emitStatus(`No action taken but task not complete: ${completionCheck.reason}`, StatusEnum.RUNNING);
                        this.memory.push(`Step ${currentStep + 1}: No action taken - ${completionCheck.reason}`);
                    }
                } else {
                    // Tools were executed
                    const toolName = steps[0].toolCalls[0].name;
                    this.emitStatus(`Executed tool: ${toolName}`, StatusEnum.RUNNING, {
                        toolName,
                        toolParams: steps[0].toolCalls[0].parameters,
                        toolResults: toolResults
                    });

                    // Add to memory
                    this.memory.push(`Step ${currentStep + 1}: Used ${toolName} - ${text}`);
                    if (toolResults && toolResults.length > 0) {
                        this.memory.push(`Tool result: ${JSON.stringify(toolResults[0], null, 2)}`);
                    }

                    // Check for task completion after tool execution
                    const postActionScreenshot = await this.takeScreenshotWithBackoff();
                    const completionCheck = await this.checkTaskCompletion(input, postActionScreenshot.base64, `After executing ${toolName}: ${text}`);
                    
                    if (completionCheck.isComplete) {
                        this.emitStatus(completionCheck.reason, StatusEnum.END);
                        isTaskComplete = true;
                        break;
                    }
                }

                // Memory management - summarize if getting too long
                if (this.memory.length >= 10) {
                    this.emitStatus("Summarizing memory for better context", StatusEnum.RUNNING);
                    this.memory = await this.summarize(this.memory, input);
                }

                currentStep++;
            }

            // Handle max steps reached
            if (currentStep >= maxSteps && !isTaskComplete) {
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
     * Checks if the task has been completed based on current state
     */
    private async checkTaskCompletion(userGoal: string, screenshot: string, lastAction: string): Promise<{isComplete: boolean, reason: string}> {
        try {
            const { object } = await generateObject({
                model: anthropic('claude-3-5-haiku-latest'),
                schema: z.object({
                    isComplete: z.boolean().describe("Whether the user's goal has been fully accomplished"),
                    reason: z.string().describe("Clear explanation of why the task is or isn't complete"),
                    nextStepSuggestion: z.string().optional().describe("If not complete, suggest what should happen next")
                }),
                messages: [
                    {
                        role: 'system',
                        content: `You are a task completion evaluator. Analyze whether the user's goal has been fully accomplished based on:
                        1. The current screen state
                        2. The user's original goal
                        3. The memory of previous actions
                        4. The most recent action taken

                        <memory>
                        ${this.memory.length > 0 ? this.memory.join("\n") : "No previous actions."}
                        </memory>

                        Be precise in your evaluation. The task is only complete if the user's goal has been fully achieved.`
                    },
                    {
                        role: 'user',
                        content: [
                            {
                                type: "text",
                                text: `User Goal: ${userGoal}
                                
                                Last Action: ${lastAction}
                                
                                Based on the current screen and the goal, determine if the task is complete.`
                            },
                            {
                                type: "image",
                                image: screenshot,
                                mimeType: "image/png"
                            }
                        ]
                    }
                ]
            });

            return {
                isComplete: object.isComplete,
                reason: object.reason + (object.nextStepSuggestion ? ` Next: ${object.nextStepSuggestion}` : '')
            };
        } catch (error) {
            console.error('Error checking task completion:', error);
            return {
                isComplete: false,
                reason: `Unable to verify completion: ${error.message}`
            };
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
                model: anthropic('claude-3-5-sonnet-20241022'),
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
                model: anthropic('claude-3-5-sonnet-20241022'),
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