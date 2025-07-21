import { streamText, ToolSet } from 'ai';
import { ToolsFactory } from '../tools/ToolsFactory';
import { ScreenshotDto } from '@app/shared/dto';
import { Operator } from '@app/packages/ui-tars/sdk/src/types';
import { StatusEnum } from '@app/packages/ui-tars/shared/src/types';
import { IAgent } from '@app/agents/types/agent.types';

// Import types
import { ExecuteInput, AgentStatusCallback } from './types';

// Import modular components
import { MessageBuilder } from './modules/messageBuilder';
import { ScreenshotUtils } from './modules/screenshotUtils';
import { pruneImages } from './modules/messagePruner';
import { google } from '@ai-sdk/google';

// Re-export types for external use
export * from './types';


export class ReactAgent implements IAgent {
    operator: Operator;
    tools: ToolSet;
    agentStatusCallback?: AgentStatusCallback;
    memory = [];
    private screenshots: ScreenshotDto[] = [];
    private conversationMessages: any[] = []; // Store conversation history
    
    // Modular components
    private messageBuilder: MessageBuilder;
    private screenshotUtils: ScreenshotUtils;
    
    // Tools factory for class-based tools
    private toolsFactory: ToolsFactory;
    private systemPrompt: string = `You are an autonomous AI agent with desktop computer access, visual feedback via screenshots, and coordination with companion agents in an Ubuntu XFCE environment. Your responses must be comprehensive yet concise, minimizing tokens while covering all necessary details.

Process
-------
1.  Break down the task into steps where each step can be completed by one agent, be abstract, let the agents decide how to perform
2.  Generate todo with checklist
3.  Update plan at each step if deviations occur, noting changes
4.  Complete task and verify success
5.  We will give you desktop screenshot, which may can use to verify the existence of a file

Be concise yet comprehensive. Always use this exact format. Keep responses concise, avoiding unnecessary elaboration.
`;

    abortController = new AbortController();
    constructor(operator: Operator, statusCallback?: AgentStatusCallback, toolsFactory?: ToolsFactory) {
        this.operator = operator;
        if (statusCallback) {
            this.agentStatusCallback = statusCallback;
        }
        this.tools = null;
        
        // Initialize tools factory
        this.toolsFactory = toolsFactory || new ToolsFactory();
        
        // Initialize modular components
        this.messageBuilder = new MessageBuilder(this.systemPrompt);
        this.screenshotUtils = new ScreenshotUtils(this.operator);
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
     * Get conversation messages for continuation
     * @returns Array of conversation messages
     */
    public getConversationMessages(): any[] {
        return this.conversationMessages;
    }

    /**
     * Main execution method for the agent
     */
    public async execute(params: ExecuteInput) {
        try {
            // Reset abort controller for a new execution
            this.abortController.abort();
            this.abortController = new AbortController();

            // Create all tools using the factory - every tool gets statusCallback and abortController!
            this.tools = this.toolsFactory.createAllTools({
                statusCallback: this.agentStatusCallback!,  // MANDATORY - passed to all tools
                abortController: this.abortController,      // MANDATORY - passed to all tools
                operator: this.operator,
                composioApps: params.composioApps || [],   // Pass Composio apps to tools factory
                entityId: params.entityId,                 // Pass entity ID for Composio tools
                onScreenshot: (base64, conversation) => {
                    this.screenshots.push({
                        base64,
                        conversation,
                        timestamp: Date.now()
                    });
                }
            });

            // Take initial screenshot
            const initialScreenshotResult = await this.screenshotUtils.takeScreenshotWithBackoff();
            const initialScreenshot = initialScreenshotResult.base64;

            // Build initial messages - use previous messages if continuing conversation
            let messages;
            if (params.previousMessages && params.previousMessages.length > 0) {
                // Continue from previous conversation
                messages = [...params.previousMessages];
                // Add the new user input to continue the conversation
                messages.push({
                    role: 'user',
                    content: [
                        { type: 'text', text: params.input },
                        { type: 'image', image: initialScreenshot }
                    ]
                });
            } else {
                // Start new conversation
                messages = this.messageBuilder.buildInitialMessages(params.input, initialScreenshot);
            }
            let iteration = 1;

            // Use AI SDK's maxSteps with onStepFinish callback
            const result = streamText({
                model: google('gemini-2.5-flash'),
                messages,
                tools: this.tools,
                maxSteps: params.maxSteps,
                toolChoice: 'auto',
                abortSignal: this.abortController.signal,
                onStepFinish: async ({ stepType }) => {
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

                        iteration++;
                    }
                }
            });

            let text = '';
            
            // Stream text in real-time to the frontend
            for await (const textPart of result.textStream) {
                text += textPart;
                this.emitStatus(text, StatusEnum.RUNNING);
            }
            
            const steps = await result.steps;

            // Store the final conversation messages for future continuation
            this.conversationMessages = [...messages];

            if(steps.length === params.maxSteps) {
                return this.emitStatus(text, StatusEnum.MAX_LOOP)
            }

            return this.emitStatus(text, StatusEnum.END);
        } catch (error) {
            this.emitStatus(`Agent execution failed: ${error.message}`, StatusEnum.ERROR, { error });
            throw error;
        }
    }
}