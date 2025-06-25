import { generateText, ToolCallUnion, ToolResult, ToolSet } from 'ai';
import { createGuiAgentTool } from 'tools/guiAgentTool';
import { humanLayerTool } from 'tools/humanLayerTool';
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

// Import types
import { ExecuteInput, AgentStatusCallback } from './types';

// Import modular components
import { MessageBuilder } from './modules/messageBuilder';
import { SummaryManager } from './modules/summaryManager';
import { ScreenshotUtils } from './modules/screenshotUtils';
import { TaskCompletionChecker } from './modules/taskCompletionChecker';

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
    private summaryManager: SummaryManager;
    private screenshotUtils: ScreenshotUtils;
    private taskCompletionChecker: TaskCompletionChecker;
    private systemPrompt: string = `
# Identity
You are an autonomous AI agent with desktop computer access, visual feedback via screenshots, and coordination with companion agents.

## Components
- **guiAgentTool**: Direct GUI controller for mouse/keyboard
- **Background Agents**: Specialists in separate sessions, share /config directory
- **Trust**: Accept companion completion reports as accurate
- **Terminology**: "Tool agents," "companions," and "agents" used interchangeably

## Process
1. Analyze task and current state
2. Generate overall plan with steps
3. Coordinate via /config, execute through guiAgentTool
4. Monitor via screenshots and reports
5. Adapt based on feedback

## Strict Response Format (minimize tokens)
- **Plan**: Strategy overview
- **Steps**: Agent assignments and commands
- **Coordination**: Synchronization points
- **Success**: Completion criteria

Always use this exact format.`;

    abortController = new AbortController();
    constructor(operator: Operator, statusCallback?: AgentStatusCallback) {
        this.operator = operator;
        if (statusCallback) {
            this.agentStatusCallback = statusCallback;
        }
        this.tools = null;
        
        // Initialize modular components
        this.messageBuilder = new MessageBuilder(this.systemPrompt);
        this.summaryManager = new SummaryManager();
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

            // Setup for agent loop
            let currentScreenshot = initialScreenshot;
            let previousScreenshot = null;
            let cumulativeSummary = '';
            let iteration = 1;

            // Main agent loop
            while (iteration <= params.maxSteps) {
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
                    
                    this.emitStatus(`${currentTool}: ${JSON.stringify(toolParams)}`, StatusEnum.RUNNING);
                } else {
                    this.emitStatus(text, StatusEnum.END);
                    break;
                }

                // Generate/update summary
                if (iteration === 1) {
                    cumulativeSummary = await this.summaryManager.generateSummary(toolCalls, toolResults);
                } else {
                    cumulativeSummary = await this.summaryManager.updateSummary(cumulativeSummary, toolCalls, toolResults);
                }


                // Check if task is completed using AI analysis
                const taskCompletionCheck = await this.taskCompletionChecker.checkTaskCompletion(params.input, cumulativeSummary, currentScreenshot);
                if (taskCompletionCheck.isCompleted) {
                    this.emitStatus(`Task completed: ${taskCompletionCheck.reason}`, StatusEnum.END);
                    console.log("[abortController] aborting all pending transactions", this.abortController)
                    this.abortController.abort();
                    break;
                }

                this.emitStatus(cumulativeSummary, StatusEnum.RUNNING);

                // Check if max iterations reached
                if (iteration >= params.maxSteps) {
                    this.emitStatus("MAX_LOOP: " + cumulativeSummary, StatusEnum.MAX_LOOP);
                    break;
                }

                // Prepare for next iteration
                previousScreenshot = currentScreenshot;
                const newScreenshotResult = await this.screenshotUtils.takeScreenshotWithBackoff();
                currentScreenshot = newScreenshotResult.base64;

                // Build messages for next iteration
                messages = this.messageBuilder.buildIterationMessages(
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