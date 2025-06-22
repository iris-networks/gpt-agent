import { generateObject, generateText, ToolSet } from 'ai';
import { createGuiAgentTool } from 'tools/guiAgentTool';
import { humanLayerTool } from 'tools/humanLayerTool';
import { z } from 'zod';
import { ExecuteInput, FileMetadata, AgentStatusCallback, IAgent } from './types/agent.types';
import { DEFAULT_CONFIG } from '@app/shared/constants';

import { anthropic } from '@ai-sdk/anthropic';
import { ScreenshotDto } from '@app/shared/dto';
import { excelTool } from 'tools/excelTool';
import { Operator } from '@app/packages/ui-tars/sdk/src/types';
import { StatusEnum } from '@app/packages/ui-tars/shared/src/types';
import { UITarsModelConfig } from '@app/packages/ui-tars/sdk/src/Model';

// Import prompts
import {
    getSystemPrompt,
    getTaskCompletionPrompt,
    getMemorySummarizationPrompt,
    getConversationSummaryPrompt,
    getFinalSummaryPrompt
} from './prompts';
import { createFileSystemAgent } from 'tools/fileSystem';

export class ReactAgent implements IAgent {
    operator: Operator;
    tools: ToolSet;
    agentStatusCallback?: AgentStatusCallback;
    memory = [];
    private screenshots: ScreenshotDto[] = []; // Add screenshots array
    private files: FileMetadata[] = []; // Array to store file metadata for tool usage
    private isExecuting: boolean = false; // Flag to track if a task is currently executing
    private currentInput: string | null = null; // Current user input being processed
    private conversationHistory: {role: 'user' | 'assistant', content: string}[] = []; // Track full conversation history

    abortController = new AbortController(); 
    constructor(operator: Operator, statusCallback?: AgentStatusCallback) {
        this.operator = operator;
        if (statusCallback) {
            this.agentStatusCallback = statusCallback;
        }

        this.tools = {
            guiAgent: createGuiAgentTool({
                abortController: this.abortController,
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
            excelTool,
            fileAgentTool: createFileSystemAgent(this.abortController)
        };

        console.log('Available tools:', Object.keys(this.tools));
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
     * Takes a screenshot with constant delay retries in case of failures
     * This helps when the page is in a navigation state
     */
    private async takeScreenshotWithBackoff(maxRetries = 4, delayMs = 500): Promise<{base64: string}> {
        let retries = 0;

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

                // Constant delay with small jitter
                const jitter = Math.random() * 100;
                await new Promise(resolve => setTimeout(resolve, delayMs + jitter));
            }
        }

        // Fallback in case loop exits unexpectedly
        return await this.operator.screenshot();
    }

    public async execute(params: ExecuteInput) {
        try {
            // If already executing, stop the current execution and append the new message
            if (this.isExecuting) {
                this.emitStatus("New message received. Stopping current execution.", StatusEnum.RUNNING);

                // Abort the current execution
                this.abortController.abort();

                // Create a new abort controller for the next execution
                this.abortController = new AbortController();

                // Recreate the guiAgent tool with the new abortController
                this.tools.guiAgent = createGuiAgentTool({
                    abortController: this.abortController,
                    operator: this.operator,
                    timeout: 120000,
                    config: {
                        "baseURL": process.env.VLM_BASE_URL,
                        "apiKey": process.env.VLM_API_KEY,
                        "model": DEFAULT_CONFIG.VLM_MODEL_NAME,
                    } as UITarsModelConfig,
                    onScreenshot: (base64, conversation) => {
                        this.screenshots.push({
                            base64,
                            conversation,
                            timestamp: Date.now()
                        });
                    }
                });

                // Handle new user message in conversation history
                if (this.currentInput) {
                    // Generate a summary of actions taken so far instead of keeping full history
                    const actionSummary = await this.generateConversationSummary(this.memory);

                    // Reset conversation history to just the summary and new input
                    this.conversationHistory = [
                        // Summary of previous conversation as system message
                        {
                            role: 'assistant',
                            content: actionSummary
                        },
                        // New user message
                        {
                            role: 'user',
                            content: params.input
                        }
                    ];

                    // Update input with previous summary context + new message
                    params.input = `PREVIOUS ACTIONS SUMMARY: ${actionSummary}\n\nUSER: ${params.input}`;
                    this.emitStatus("Continuing conversation with summarized history", StatusEnum.RUNNING);
                } else {
                    // First message in conversation
                    this.conversationHistory.push({
                        role: 'user',
                        content: params.input
                    });
                }
            }

            // Set execution flag and store current input
            this.isExecuting = true;
            this.currentInput = params.input;

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
            while (currentStep < maxSteps && !isTaskComplete && !this.abortController.signal.aborted) {
                const screenshot = await this.takeScreenshotWithBackoff();

                // Single AI call that handles: planning, action selection, execution, and progress evaluation
                const { text, toolResults, steps } = await generateText({
                    model: anthropic("claude-3-5-haiku-latest"),
                    abortSignal: this.abortController.signal,
                    system: getSystemPrompt(this.memory, this.files, this.conversationHistory),
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
                    this.emitStatus(`Error in execution step`, StatusEnum.ERROR);
                    return {
                        text: `EXECUTION_ERROR: ${error.message}`,
                        toolResults: [],
                        steps: [{ toolCalls: [] }]
                    };
                });

                // Add assistant response to conversation history
                if (currentStep > 0 || this.conversationHistory.length > 1) {
                    // Add the current assistant response
                    this.conversationHistory.push({
                        role: 'assistant',
                        content: text
                    });

                    // If conversation history gets too long, summarize it
                    if (this.conversationHistory.length > 10) {
                        this.emitStatus("Summarizing conversation history", StatusEnum.RUNNING);

                        // Generate conversation summary
                        const conversationSummary = await this.generateConversationSummary(
                            this.conversationHistory.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
                        );

                        // Reset conversation history to just the summary
                        this.conversationHistory = [
                            {
                                role: 'assistant',
                                content: `CONVERSATION SUMMARY: ${conversationSummary}`
                            }
                        ];
                    }
                }

                // Check if no tools were called (task might be complete or needs clarification)
                if (steps[0].toolCalls.length === 0) {
                    // Use another AI call to verify the current state
                    const completionCheck = await this.checkTaskCompletion(input, screenshot.base64, text);

                    if (completionCheck.isComplete) {
                        // Show the immediate response while generating the final summary
                        this.emitStatus(text, StatusEnum.RUNNING);

                        // Generate a comprehensive final summary with the current screenshot
                        const finalSummary = await this.generateFinalSummary(input, this.memory, screenshot.base64);

                        // Emit the final summary as the end status
                        this.emitStatus(finalSummary, StatusEnum.END);
                        isTaskComplete = true;
                        break;
                    } else if (completionCheck.needsClarification) {
                        // Agent needs clarification from the user
                        this.emitStatus(completionCheck.clarificationText, StatusEnum.CALL_USER);
                        this.memory.push(`Step ${currentStep + 1}: Asked for clarification - ${completionCheck.clarificationText}`);
                        isTaskComplete = true; // Break the loop to get user input
                        break;
                    } else {
                        // Not complete, no clarification needed, but no tools called - there might be an issue
                        this.emitStatus(`No action taken but task not complete`, StatusEnum.RUNNING);
                        this.memory.push(`Step ${currentStep + 1}: No action taken`);
                    }
                } else {
                    // Tools were executed
                    const toolName = steps[0].toolCalls[0].toolName;
                    const toolInput = JSON.stringify(steps[0].toolCalls[0].args);
                    this.emitStatus(`Executed tool: ${toolName} with ${toolInput}`, StatusEnum.RUNNING, {
                        toolName,
                        toolParams: steps[0].toolCalls[0].args,
                        toolResults: toolResults
                    });

                    // Add to memory
                    this.memory.push(`Step ${currentStep + 1}: Used ${toolName} - ${toolInput}`);
                    if (toolResults && toolResults.length > 0) {
                        this.memory.push(`Tool result: ${JSON.stringify(toolResults[0], null, 2)}`);
                    }

                    // Check for task completion or clarification needs after tool execution
                    const postActionScreenshot = await this.takeScreenshotWithBackoff();
                    const completionCheck = await this.checkTaskCompletion(input, postActionScreenshot.base64, `After executing ${toolName}: ${text}`);

                    if (completionCheck.isComplete) {
                        // Show the immediate response while generating the final summary
                        this.emitStatus(`Task completed: ${text}`, StatusEnum.RUNNING);

                        // Generate a comprehensive final summary with the current screenshot
                        const finalSummary = await this.generateFinalSummary(input, this.memory, postActionScreenshot.base64);

                        // Emit the final summary as the end status
                        this.emitStatus(finalSummary, StatusEnum.END);
                        isTaskComplete = true;
                        break;
                    } else if (completionCheck.needsClarification) {
                        // Agent needs clarification from the user after tool execution
                        this.emitStatus(completionCheck.clarificationText, StatusEnum.CALL_USER);
                        this.memory.push(`Step ${currentStep + 1}: Asked for clarification after ${toolName} - ${completionCheck.clarificationText}`);
                        isTaskComplete = true; // Break the loop to get user input
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
            if (currentStep >= maxSteps && !isTaskComplete && !this.abortController.signal.aborted) {
                // Take a final screenshot for the summary
                const finalScreenshot = await this.takeScreenshotWithBackoff();

                // Generate final summary with the current screenshot
                const summary = await this.generateFinalSummary(input, this.memory, finalScreenshot.base64);

                this.emitStatus(summary, StatusEnum.END, {
                    stepsExecuted: currentStep,
                    maxSteps
                });
            }

        } catch (error) {
            // Only emit error if it's not an AbortError (which is expected when stopping execution)
            if (error.name !== 'AbortError') {
                this.emitStatus(`Error during execution: ${error.message}`, StatusEnum.ERROR);
                throw error;
            } else {
                this.emitStatus("Execution stopped due to new message", StatusEnum.END);
            }
        } finally {
            // Reset execution state if not aborted (if aborted, the new execution will have already started)
            if (!this.abortController.signal.aborted) {
                this.isExecuting = false;
            }
        }
    }

    /**
     * Checks if the task has been completed based on current state
     */
    private async checkTaskCompletion(userGoal: string, screenshot: string, lastAction: string): Promise<{isComplete: boolean, needsClarification: boolean, clarificationText: string}> {
        try {
            const { object } = await generateObject({
                model: anthropic('claude-3-5-haiku-latest'),
                schema: z.object({
                    isComplete: z.boolean().describe("Whether the user's goal has been fully accomplished"),
                    needsClarification: z.boolean().describe("Whether the agent is asking for clarification from the user"),
                    clarificationText: z.string().describe("If needsClarification is true, provide the specific clarification question or text to send to the user. If not, return 'NO_CLARIFICATION_NEEDED'")
                }),
                messages: [
                    {
                        role: 'system',
                        content: getTaskCompletionPrompt(this.memory, this.conversationHistory)
                    },
                    {
                        role: 'user',
                        content: [
                            {
                                type: "text",
                                text: `User Goal: ${userGoal}

                                Last Action: ${lastAction}

                                Based on the current screen and the goal, determine if the task is complete, needs clarification, or should continue. If clarification is needed, provide the specific clarification text to send to the user.`
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
                needsClarification: object.needsClarification,
                clarificationText: object.clarificationText
            };
        } catch (error) {
            console.error('Error checking task completion:', error);
            return {
                isComplete: false,
                needsClarification: false,
                clarificationText: "NO_CLARIFICATION_NEEDED"
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
                abortSignal: this.abortController.signal,
                system: getMemorySummarizationPrompt(),
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
     * Generates a summary of the current conversation and actions taken
     * Used when a new message comes in to provide context continuity
     * @param input Can be either memory array or conversation history array
     */
    async generateConversationSummary(input: any[]): Promise<string> {
        if (input.length === 0) return "No actions have been taken yet.";

        try {
            // Determine if we're summarizing memory or conversation
            const isMemory = typeof input[0] !== 'object' || !('role' in input[0]);
            const contentType = isMemory ? 'memory entries' : 'conversation history';

            // Format the input appropriately
            const formattedInput = isMemory
                ? input.join('\n\n')
                : input.join('\n\n');

            const { text } = await generateText({
                model: anthropic('claude-3-5-haiku-latest'),
                abortSignal: this.abortController.signal,
                system: getConversationSummaryPrompt(isMemory),
                messages: [
                    {
                        role: 'user',
                        content: `Here are the ${contentType} so far:
${formattedInput}

Create a brief, conversational summary of what has been done and discussed so far. This will be shown to the user as part of the ongoing conversation.`
                    }
                ]
            });

            return text;
        } catch (error) {
            console.error('Failed to generate summary:', error);
            return "I've been working on your previous request. What else would you like me to do?";
        }
    }

    /**
     * Generates a comprehensive final summary including current screenshot
     * @param input Original user instruction
     * @param memory Array of memory entries
     * @param screenshot Optional screenshot in base64 format
     * @returns A comprehensive summary string
     */
    async generateFinalSummary(input: string, memory: any[], screenshot?: string): Promise<string> {
        if (memory.length === 0) return "No progress to report.";

        try {
            // Take a fresh screenshot if one wasn't provided
            if (!screenshot) {
                try {
                    const screenshotResult = await this.takeScreenshotWithBackoff();
                    screenshot = screenshotResult.base64;
                } catch (error) {
                    console.warn('Failed to capture final screenshot:', error);
                    // Continue without screenshot if it fails
                }
            }

            const { text } = await generateText({
                model: anthropic('claude-3-5-sonnet-20241022'),
                abortSignal: this.abortController.signal,
                system: getFinalSummaryPrompt(),
                messages: [
                    {
                        role: 'user',
                        content: screenshot ? [
                            {
                                type: "text",
                                text: `User's original request: ${input}

Memory entries (for reference only, do NOT discuss these in your answer):
${memory.join('\n\n')}

IMPORTANT: Provide a direct answer to the user's original request. DO NOT explain your process or intermediate steps. Focus only on giving the exact information or result they asked for.

The screenshot shows the current state - use it to provide the most accurate answer to the user's question.`
                            },
                            {
                                type: "image",
                                image: screenshot,
                                mimeType: "image/png"
                            }
                        ] : `User's original request: ${input}

Memory entries (for reference only, do NOT discuss these in your answer):
${memory.join('\n\n')}

IMPORTANT: Provide a direct answer to the user's original request. DO NOT explain your process or intermediate steps. Focus only on giving the exact information or result they asked for.`
                    }
                ]
            });

            return text;
        } catch (error) {
            console.error('Failed to generate final summary:', error);
            return `Progress summary generation failed: ${error.message}`;
        }
    }
}