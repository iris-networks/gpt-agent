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
                    // Add the new user message to conversation history
                    this.conversationHistory.push({
                        role: 'user',
                        content: params.input
                    });

                    // Generate a summary of actions taken so far
                    const actionSummary = await this.generateConversationSummary(this.memory);

                    // Add the agent's summary to conversation history
                    this.conversationHistory.push({
                        role: 'assistant',
                        content: actionSummary
                    });

                    // Update the input to include the full conversation history
                    const formattedHistory = this.conversationHistory.map(msg =>
                        `${msg.role.toUpperCase()}: ${msg.content}`
                    ).join('\n\n');

                    params.input = formattedHistory;
                    this.emitStatus("Continuing conversation with full history", StatusEnum.RUNNING);
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
                    1. First, generate an overall plan of how to achieve the user's goal and outline the steps required
                    2. Analyze the current screenshot and understand the state
                    3. Consider the user's goal and what has been accomplished so far (from memory)
                    4. Determine if the task is complete - if so, respond without calling any tools
                    5. If the user's request is unclear or ambiguous, do not attempt to complete it - instead respond with a clarifying question
                    6. If not complete and the request is clear, choose the most appropriate tool and action to make progress
                    7. Focus on making meaningful progress toward the goal

                    Available tools:
                    - guiAgent: For web/GUI interactions (clicking, typing, navigating)
                    - terminalAgentTool: For command line operations
                    - humanLayerTool: When human input or decision is needed
                    - excelTool: For Excel file operations (use file IDs from available_files)
                    - codeTool: For code analysis and modifications

                    Guidelines:
                    - NEVER use search engine overviews when preparing responses - rely only on your own analysis and observations
                    - Generate a clear plan before taking action
                    - Make decisive actions that move toward the goal
                    - If you encounter errors, adapt your approach
                    - Use memory to avoid repeating failed attempts
                    - Be specific in your tool usage
                    - Consider the current state when deciding next actions
                    - If the task appears complete, explain why and don't call tools

                    ## When to Ask for Clarification
                    Ask clarifying questions when:
                    1. The user's request is vague, ambiguous, or could be interpreted in multiple ways
                    2. You need specific information to proceed (e.g., which account to use, which option to select)
                    3. You've encountered an unexpected state and need guidance on how to proceed
                    4. You're faced with multiple possible actions and it's not clear which one the user would prefer
                    5. You need a decision from the user about how to handle an error or warning

                    When asking for clarification:
                    - Be specific about what information you need
                    - Provide options when possible to make it easier for the user to respond
                    - Explain why you need the clarification
                    - Do not call any tools when asking for clarification - just respond with your question

                    ## GUI Specific Instructions
                    For actions involving click and type, prioritize the screenshot to decide your next action.
                    Pass relevant context in the memory parameter when using guiAgent.

                    ## Memory Management for Browser Interactions
                    When interacting with a browser:
                    1. Track all tabs that you open (URLs and titles)
                    2. For each tab, keep a brief description of its content
                    3. When you copy content from a tab, make a note of what was copied (brief description)
                    4. When copying new content, replace your memory of what was previously copied
                    5. Only remember the most recently copied content (like a clipboard)
                    6. When pasting content, reference what you're pasting and where it came from
                    7. This information must be maintained in your memory across the entire session`,
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

                if (currentStep > 0 || this.conversationHistory.length > 1) {
                    this.conversationHistory.push({
                        role: 'assistant',
                        content: text
                    });
                }

                // Check if no tools were called (task might be complete or needs clarification)
                if (steps[0].toolCalls.length === 0) {
                    // Use another AI call to verify the current state
                    const completionCheck = await this.checkTaskCompletion(input, screenshot.base64, text);

                    if (completionCheck.isComplete) {
                        this.emitStatus(text, StatusEnum.END);
                        isTaskComplete = true;
                        break;
                    } else if (completionCheck.needsClarification) {
                        // Agent needs clarification from the user
                        this.emitStatus(`Awaiting user clarification`, StatusEnum.CALL_USER);
                        this.memory.push(`Step ${currentStep + 1}: Asked for clarification - ${text}`);
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
                        isTaskComplete = true;
                        break;
                    } else if (completionCheck.needsClarification) {
                        // Agent needs clarification from the user after tool execution
                        this.emitStatus(`Awaiting user clarification`, StatusEnum.CALL_USER);
                        this.memory.push(`Step ${currentStep + 1}: Asked for clarification after ${toolName} - ${text}`);
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
                const summary = await this.generateFinalSummary(input, this.memory);
                this.emitStatus(summary, StatusEnum.MAX_LOOP, {
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
                this.emitStatus("Execution stopped due to new message", StatusEnum.RUNNING);
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
    private async checkTaskCompletion(userGoal: string, screenshot: string, lastAction: string): Promise<{isComplete: boolean, needsClarification: boolean}> {
        try {
            const { object } = await generateObject({
                model: anthropic('claude-3-5-haiku-latest'),
                schema: z.object({
                    isComplete: z.boolean().describe("Whether the user's goal has been fully accomplished"),
                    needsClarification: z.boolean().describe("Whether the agent is asking for clarification from the user")
                }),
                messages: [
                    {
                        role: 'system',
                        content: `You are a task completion evaluator. Analyze the current state to determine if:
                        1. The user's goal has been fully accomplished (isComplete = true)
                        2. The agent needs clarification from the user to proceed (needsClarification = true)
                        3. The task should continue with further steps (isComplete = false, needsClarification = false)

                        Base your evaluation on:
                        1. The current screen state
                        2. The user's original goal
                        3. The memory of previous actions
                        4. The most recent action taken

                        <memory>
                        ${this.memory.length > 0 ? this.memory.join("\n") : "No previous actions."}
                        </memory>

                        Guidelines:
                        - If the agent is asking a question to the user, set needsClarification = true
                        - If the agent cannot proceed without user input, set needsClarification = true
                        - If the task is ambiguous and requires user guidance, set needsClarification = true
                        - If the goal has been completely achieved, set isComplete = true
                        - If further steps are needed and the agent can proceed without user input, set both flags to false`
                    },
                    {
                        role: 'user',
                        content: [
                            {
                                type: "text",
                                text: `User Goal: ${userGoal}

                                Last Action: ${lastAction}

                                Based on the current screen and the goal, determine if the task is complete, needs clarification, or should continue.`
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
                needsClarification: object.needsClarification
            };
        } catch (error) {
            console.error('Error checking task completion:', error);
            return {
                isComplete: false,
                needsClarification: false
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
                - Files: When dealing with files, summary must contain the fileName, metadata, the last row read and structure of the file. This will never be removed from memory.

                CRITICAL: Always preserve the following information in your summary:
                - Any open browser tabs (URLs and titles)
                - Content descriptions for each tab
                - ONLY the most recently copied content (like a clipboard)
                - The relationship between copied content and where it was pasted

                When summarizing information about copied content, only keep track of the most recent clipboard content, replacing older copied content in your summary. This browser context information is essential for maintaining continuity and must never be summarized away.`,
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
     */
    async generateConversationSummary(memory: any[]): Promise<string> {
        if (memory.length === 0) return "No actions have been taken yet.";

        try {
            const { text } = await generateText({
                model: anthropic('claude-3-5-haiku-latest'),
                system: `You are a summarization agent tasked with creating a concise summary of actions taken during an ongoing conversation.
                Your summary should:
                1. Be brief but informative (3-5 sentences maximum)
                2. Focus on what has been accomplished so far
                3. Mention any important state changes or discoveries
                4. Be conversational in tone
                5. End with the current state before the new message arrived

                The user will see this summary as part of the ongoing conversation.`,
                messages: [
                    {
                        role: 'user',
                        content: `Here are the memory entries of actions taken so far:
${memory.join('\n\n')}

Create a brief, conversational summary of what has been done so far. This will be shown to the user as part of the ongoing conversation.`
                    }
                ]
            });

            return text;
        } catch (error) {
            console.error('Failed to generate conversation summary:', error);
            return "I've been working on your previous request. What else would you like me to do?";
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