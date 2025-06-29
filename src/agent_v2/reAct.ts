import { generateText, ToolCallUnion, ToolResult, ToolSet, CoreMessage } from 'ai';
import { createGuiAgentTool } from 'tools/guiAgentTool';
import { humanLayerTool } from 'tools/humanLayerTool';
import { DEFAULT_CONFIG } from '@app/shared/constants';
import * as path from 'path';
import { ScreenshotDto } from '@app/shared/dto';
import { excelTool } from 'tools/excelTool';
import { Operator } from '@app/packages/ui-tars/sdk/src/types';
import { StatusEnum } from '@app/packages/ui-tars/shared/src/types';
import { UITarsModelConfig } from '@app/packages/ui-tars/sdk/src/Model';

import { createFileSystemAgent } from 'tools/fileSystem';
import { writeMessagesToFile } from 'tools/fileSystem/utils';
import { IAgent } from '@app/agents/types/agent.types';

// Import types
import { ExecuteInput, AgentStatusCallback } from './types';

// Import modular components
import { MessageBuilder } from './modules/messageBuilder';
import { ProgressTracker } from './modules/progressTracker';
import { ScreenshotUtils } from './modules/screenshotUtils';
import { TaskCompletionChecker } from './modules/taskCompletionChecker';
import { pruneImages } from './modules/messagePruner';
import { groq } from '@ai-sdk/groq';
import { anthropic } from '@ai-sdk/anthropic';

// Re-export types for external use
export * from './types';


export class ReactAgent implements IAgent {
    operator: Operator;
    tools: ToolSet;
    agentStatusCallback?: AgentStatusCallback;
    memory = [];
    private screenshots: ScreenshotDto[] = [];
    
    // Modular components
    private messageBuilder: MessageBuilder;
    private progressTracker: ProgressTracker;
    private screenshotUtils: ScreenshotUtils;
    private taskCompletionChecker: TaskCompletionChecker;
    private systemPrompt: string = `# Identity
You are an autonomous AI agent with desktop computer access, visual feedback via screenshots, and coordination with companion agents in an Ubuntu XFCE environment. Your responses must be comprehensive yet concise, minimizing tokens while covering all necessary details.

## Components
- Environment: Ubuntu XFCE desktop environment
- Background Agents: Specialists in separate sessions, share /config directory
- Trust: Accept companion completion reports as accurate
- Terminology: "Tool agents," "companions," and "agents" used interchangeably

## Process
1. Analyze task and current state
2. Generate todo with checklist
3. Monitor via screenshots and companion reports
4. Update plan at each step if deviations occur, noting changes
5. Complete task and verify success

## Strict Response Format
- **Plan**: Generate plan using numbered Todo list
- **Success**: Clear completion criteria
- **Updates**: Log any plan deviations or adjustments at each step

Always use this exact format. Keep responses concise, avoiding unnecessary elaboration.

## Additional Notes
- Ensure plans include all checkpoints to track progress.
- Update plans dynamically based on feedback or unexpected outcomes.`;

    abortController = new AbortController();
    constructor(operator: Operator, statusCallback?: AgentStatusCallback) {
        this.operator = operator;
        if (statusCallback) {
            this.agentStatusCallback = statusCallback;
        }
        this.tools = null;
        
        // Initialize modular components
        this.messageBuilder = new MessageBuilder(this.systemPrompt);
        this.progressTracker = new ProgressTracker();
        this.screenshotUtils = new ScreenshotUtils(this.operator);
        this.taskCompletionChecker = new TaskCompletionChecker();
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
            const initialScreenshotResult = await this.screenshotUtils.takeScreenshotWithBackoff();
            const initialScreenshot = initialScreenshotResult.base64;

            // Build initial messages
            let messages = this.messageBuilder.buildInitialMessages(params.input, initialScreenshot);
            let cumulativeSummary = '';
            let iteration = 1;

            // Use AI SDK's maxSteps with onStepFinish callback
            await generateText({
                model: anthropic('claude-sonnet-4-20250514'),
                messages,
                tools: this.tools,
                maxSteps: params.maxSteps,
                toolChoice: 'auto',
                onStepFinish: async ({ toolCalls, toolResults, text, stepType }) => {
                    // Log tool usage
                    if (toolCalls && toolCalls.length > 0) {
                        const currentTool = toolCalls[0].toolName;
                        const toolParams = toolCalls[0].args;
                        this.emitStatus(`${currentTool}: ${JSON.stringify(toolParams)}`, StatusEnum.RUNNING);
                    }

                    // Update progress tracker
                    // if (toolCalls && toolResults) {
                    //     cumulativeSummary = await this.progressTracker.updateProgress(
                    //         toolCalls, 
                    //         toolResults, 
                    //         iteration === 1 ? undefined : cumulativeSummary
                    //     );
                    //     this.emitStatus(cumulativeSummary, StatusEnum.RUNNING);
                    // }

                    // Take new screenshot for next iteration
                    if (stepType === 'tool-result') {
                        const newScreenshotResult = await this.screenshotUtils.takeScreenshotWithBackoff();
                        const currentScreenshot = newScreenshotResult.base64;

                        // Add screenshot to messages and prune old images
                        messages.push({
                            role: 'user',
                            content: [
                                { type: 'text', text: `Screenshot after step ${iteration}:` },
                                { type: 'image', image: currentScreenshot }
                            ]
                        });

                        // Prune images to keep only last X
                        const prunedMessages = pruneImages(messages);
                        messages.splice(0, messages.length, ...prunedMessages);

                        // Save messages to file
                        const messagesFile = path.join(process.cwd(), 'agent_messages.json');
                        writeMessagesToFile(messagesFile, iteration, messages);

                        iteration++;
                    }

                    // Check for task completion when no more tool calls
                    // if (text && !toolCalls?.length) {
                    //     const currentScreenshotResult = await this.screenshotUtils.takeScreenshotWithBackoff();
                    //     const taskCompletionCheck = await this.taskCompletionChecker.checkTaskCompletion(
                    //         params.input, 
                    //         cumulativeSummary, 
                    //         currentScreenshotResult.base64
                    //     );
                        
                    //     if (taskCompletionCheck.isCompleted) {
                    //         this.emitStatus(`Task completed: ${taskCompletionCheck.reason}`, StatusEnum.END);
                    //         this.abortController.abort();
                    //     } else {
                    //         this.emitStatus(text, StatusEnum.END);
                    //     }
                    // }
                }
            });


            this.emitStatus("COMPLETED: " + cumulativeSummary, StatusEnum.END);
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