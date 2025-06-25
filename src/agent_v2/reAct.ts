import { CoreMessage, generateObject, generateText, ToolCallUnion, ToolResult, ToolSet } from 'ai';
import { createGuiAgentTool } from 'tools/guiAgentTool';
import { humanLayerTool } from 'tools/humanLayerTool';
import { z } from 'zod';
import { DEFAULT_CONFIG } from '@app/shared/constants';
import * as fs from 'fs';
import * as path from 'path';

import { anthropic } from '@ai-sdk/anthropic';
import { ScreenshotDto } from '@app/shared/dto';
import { excelTool } from 'tools/excelTool';
import { Operator } from '@app/packages/ui-tars/sdk/src/types';
import { StatusEnum } from '@app/packages/ui-tars/shared/src/types';
import { UITarsModelConfig } from '@app/packages/ui-tars/sdk/src/Model';

import { createFileSystemAgent } from 'tools/fileSystem';
import { IAgent } from '@app/agents/types/agent.types';

export { ToolCall, ToolResult } from '@ai-sdk/provider-utils';

// File metadata interface
export interface FileMetadata {
    fileId: string;
    fileName: string;
    originalName?: string;
    mimeType: string;
    fileSize: number;
}

// Define the execute input schema
export const ExecuteInputSchema = z.object({
    maxSteps: z.number().int().positive().describe("Maximum number of steps to execute"),
    input: z.string().min(1).describe("User input to process"),
    files: z.array(z.object({
        fileId: z.string(),
        fileName: z.string(),
        originalName: z.string().optional(),
        mimeType: z.string(),
        fileSize: z.number()
    })).optional().describe("Array of file metadata that can be used by tools")
});

// Type for the execute input
export type ExecuteInput = z.infer<typeof ExecuteInputSchema>;

type AgentStatusCallback = (message: string, status: StatusEnum, data) => void;

export class ReactAgent implements IAgent {
    operator: Operator;
    tools: ToolSet;
    agentStatusCallback?: AgentStatusCallback;
    memory = [];
    private screenshots: ScreenshotDto[] = [];
    private systemPrompt: string = `You are an autonomous AI agent that can perform a wide variety of tasks.
You're not just limited to GUI - you can perform tasks on a computer using the tools given to you.
You should act accordingly, thinking and responding as a human would when using a computer system.
Always think step by step and provide clear explanations for your actions.

IMPORTANT DISTINCTION - Screenshots vs Tool Outputs:
- The screenshot shows you the current visual state of the desktop/screen
- Tool outputs (like file system operations) provide separate information about command results
- These two sources of information are INDEPENDENT and may show different things
- DO NOT assume the screenshot reflects the tool output or vice versa
- If a tool output indicates an action was successful, trust that result regardless of what the screenshot shows
- The screenshot and tool outputs serve different purposes and should be interpreted separately
`;

    abortController = new AbortController();
    constructor(operator: Operator, statusCallback?: AgentStatusCallback) {
        this.operator = operator;
        if (statusCallback) {
            this.agentStatusCallback = statusCallback;
        }
        this.tools = null;
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

    /**
     * Build initial messages for the first iteration
     */
    private buildInitialMessages(userMessage: string, initialScreenshot: string): CoreMessage[] {
        return [
            {
                role: 'system',
                content: this.systemPrompt
            },
            {
                role: 'user',
                content: [
                    { type: 'text', text: userMessage },
                    { type: 'image', image: initialScreenshot }
                ]
            }
        ];
    }

    /**
     * Build messages for subsequent iterations
     */
    private buildIterationMessages(
        userMessage: string,
        cumulativeSummary: string,
        currentScreenshot: string,
        previousScreenshot: string
    ): CoreMessage[] {
        return [
            {
                role: 'system',
                content: this.systemPrompt
            },
            {
                role: 'user',
                content: userMessage
            },
            {
                role: 'user',
                content: [
                    { type: 'text', text: 'Previous screenshot' },
                    { type: 'image', image: previousScreenshot }
                ]
            },
            {
                role: 'user',
                content: [
                    { type: 'text', text: 'Current screenshot' },
                    { type: 'image', image: currentScreenshot }
                ]
            },
            {
                role: 'assistant',
                content: cumulativeSummary
            }
        ];
    }

    /**
     * Generate initial summary after first iteration
     */
    private async generateSummary(toolCalls: ToolCallUnion<ToolSet>[], toolResults: ToolResult<any, any, any>[]): Promise<string> {
        try {
            const formattedActions = this.formatToolCallsAndResults(toolCalls, toolResults);

            const summaryResult = await generateText({
                model: anthropic('claude-3-5-haiku-20241022'),
                prompt: `Summarize the following actions and their results concisely:

                Actions taken:
                ${formattedActions}

                Create a brief summary that captures:
                1. What actions were performed
                2. Key outcomes or state changes
                3. Any important information for future iterations

                Do NOT include the original user request or screenshot descriptions.`,
            });

            return summaryResult.text;
        } catch (error) {
            console.error('Error generating summary:', error);
            return `Action performed: ${toolCalls[0]?.toolName || 'Unknown action'}. Result: ${JSON.stringify(toolResults[0]?.result || 'Unknown result')}`;
        }
    }

    /**
     * Update summary with new actions for subsequent iterations
     */
    private async updateSummary(
        previousSummary: string,
        toolCalls: ToolCallUnion<ToolSet>[], 
        toolResults: ToolResult<any, any, any>[]
    ): Promise<string> {
        try {
            const formattedActions = this.formatToolCallsAndResults(toolCalls, toolResults);

            const updatedSummary = await generateText({
                model: anthropic('claude-3-sonnet-20240229'),
                prompt: `Previous summary:
                ${previousSummary}

                New actions taken:
                ${formattedActions}

                Update the summary to include both the previous information and these new actions.
                Make sure to:
                1. Preserve important context from previous iterations
                2. Add details about new actions and their results
                3. Include relevant visual changes mentioned in tool results
                4. Keep the summary concise and focused on key information

                Do NOT include the original user message, screenshot data, or system instructions.`,
            });

            return updatedSummary.text;
        } catch (error) {
            console.error('Error updating summary:', error);
            return `${previousSummary}\nAdditional action: ${toolCalls[0]?.toolName || 'Unknown action'}. Result: ${JSON.stringify(toolResults[0]?.result || 'Unknown result')}`;
        }
    }

    /**
     * Check if the task has been completed based on the user input and cumulative summary
     */
    private async checkTaskCompletion(userInput: string, cumulativeSummary: string) {
        try {
            const completionCheck = await generateObject({
                model: anthropic('claude-3-5-haiku-20241022'),
                prompt: `Analyze whether the given task has been completed based on the actions performed.

                Original task: ${userInput}
                
                Summary of actions performed:
                ${cumulativeSummary}
                
                Determine if the task has been successfully completed. Consider:
                1. Has the main objective been achieved?
                2. Are there any obvious missing steps?
                3. Have any error conditions been resolved?
                4. Does the summary indicate successful completion?
                
                Be conservative - only mark as completed if there's clear evidence of success.`,
                schema: z.object({
                    isCompleted: z.boolean().describe('Whether the task has been completed'),
                    reason: z.string().describe('Brief description of the reasoning behind the conclusion')
                })
            });
            

            console.log("[checkTaskCompletion]", completionCheck.object)
            return completionCheck.object;
        } catch (error) {
            console.error('Error checking task completion:', error);
            return { isCompleted: false, reason: 'Could not determine completion status' };
        }
    }

    /**
     * Format tool calls and results for summary generation
     */
    private formatToolCallsAndResults(toolCalls: ToolCallUnion<ToolSet>[], toolResults: ToolResult<any, any, any>[]): string {
        let formatted = '';

        for (let i = 0; i < toolCalls.length; i++) {
            const call = toolCalls[i];
            const result = toolResults[i];

            formatted += `Tool: ${call.toolName}\n`;
            formatted += `Parameters: ${JSON.stringify(call.args)}\n`;
            formatted += `Result: ${JSON.stringify(result?.result || 'No result')}\n\n`;
        }

        return formatted;
    }

    /**
     * Main execution method for the agent
     */
    public async execute(params: ExecuteInput) {
        try {
            this.emitStatus('Starting agent execution', StatusEnum.RUNNING);

            // Reset abort controller for a new execution
            this.abortController.abort();
            this.abortController = new AbortController();

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
                fileAgentTool: createFileSystemAgent(this.abortController),
            };

            
            // Take initial screenshot
            const initialScreenshotResult = await this.takeScreenshotWithBackoff();
            const initialScreenshot = initialScreenshotResult.base64;

            // Build initial messages
            let messages = this.buildInitialMessages(params.input, initialScreenshot);

            // Setup for agent loop
            let currentScreenshot = initialScreenshot;
            let previousScreenshot = null;
            let cumulativeSummary = '';
            let iteration = 1;

            // Main agent loop
            while (iteration <= params.maxSteps) {
                this.emitStatus(`Running iteration ${iteration}/${params.maxSteps}`, StatusEnum.RUNNING, {
                    iteration,
                    maxSteps: params.maxSteps,
                    currentParameters: {
                        input: params.input,
                        files: params.files?.map(f => ({ fileId: f.fileId, fileName: f.fileName })) || []
                    }
                });

                // Generate AI response with tool calls
                const { toolCalls, toolResults, text } = await generateText({
                    model: anthropic('claude-sonnet-4-20250514'),
                    messages,
                    tools: this.tools,
                    maxSteps: 1,
                    toolChoice: 'auto',
                });

                // Log tool usage
                if (toolCalls.length > 0) {
                    const currentTool = toolCalls[0].toolName;
                    const toolParams = toolCalls[0].args;
                    this.emitStatus(`Tool used: ${currentTool}`, StatusEnum.RUNNING, {
                        toolCall: {
                            toolName: currentTool,
                            parameters: JSON.stringify(toolParams)
                        },
                        allToolCalls: toolCalls.map(call => ({
                            toolName: call.toolName,
                            parameters: JSON.stringify(call.args)
                        }))
                    });
                } else {
                    this.emitStatus(text, StatusEnum.END);
                    break;
                }

                // Generate/update summary
                if (iteration === 1) {
                    cumulativeSummary = await this.generateSummary(toolCalls, toolResults);
                } else {
                    cumulativeSummary = await this.updateSummary(cumulativeSummary, toolCalls, toolResults);
                }


                // Check if task is completed using AI analysis
                const taskCompletionCheck = await this.checkTaskCompletion(params.input, cumulativeSummary);
                if (taskCompletionCheck.isCompleted) {
                    this.emitStatus(`Task completed: ${taskCompletionCheck.reason}`, StatusEnum.END, {
                        iterations: iteration,
                        completionReason: taskCompletionCheck.reason,
                        finalSummary: cumulativeSummary
                    });
                    console.log("[abortController] aborting all pending transactions", this.abortController)
                    this.abortController.abort();
                    break;
                }

                this.emitStatus("summary: " + cumulativeSummary, StatusEnum.RUNNING);

                // Check if max iterations reached
                if (iteration >= params.maxSteps) {
                    this.emitStatus('Maximum iterations reached without task completion', StatusEnum.MAX_LOOP, {
                        iterations: iteration,
                        finalSummary: cumulativeSummary
                    });
                    break;
                }

                // Prepare for next iteration
                previousScreenshot = currentScreenshot;
                const newScreenshotResult = await this.takeScreenshotWithBackoff();
                currentScreenshot = newScreenshotResult.base64;

                // Build messages for next iteration
                messages = this.buildIterationMessages(
                    params.input,
                    cumulativeSummary,
                    currentScreenshot,
                    previousScreenshot
                );


                const messagesFile = path.join(process.cwd(), 'agent_messages.json');
                fs.writeFileSync(messagesFile, JSON.stringify({ 
                    timestamp: new Date().toISOString(),
                    iteration: iteration,
                    messages: messages 
                }, null, 2));

                iteration++;
            }

            console.log("[Final]", JSON.stringify({
                finalSummary: cumulativeSummary,
                totalIterations: iteration,
                screenshots: this.getScreenshots(),
            }, null, 2));
        } catch (error) {
            this.emitStatus(`Agent execution failed: ${error.message}`, StatusEnum.ERROR, { error });
            throw error;
        }
    }
}