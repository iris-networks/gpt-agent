import { generateText, ToolSet } from 'ai';
import { ToolsFactory } from '../tools/ToolsFactory';
import * as path from 'path';
import { ScreenshotDto } from '@app/shared/dto';
import { Operator } from '@app/packages/ui-tars/sdk/src/types';
import { StatusEnum } from '@app/packages/ui-tars/shared/src/types';
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
import { google } from '@ai-sdk/google';

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
    
    // Tools factory for class-based tools
    private toolsFactory: ToolsFactory;
    private systemPrompt: string = `You are an autonomous AI agent with desktop computer access, visual feedback via screenshots, and coordination with companion agents in an Ubuntu XFCE environment. Your responses must be comprehensive yet concise, minimizing tokens while covering all necessary details.

Components
----------

   Environment: Ubuntu XFCE desktop environment
   Background Agents: Specialists in separate sessions, share /config directory
   Trust: Accept companion completion reports as accurate
   Terminology: "Tool agents," "companions," and "agents" used interchangeably

Tool Usage Guidelines
---------------------

 Terminal Tool (Primary - 90% of tasks)

Use terminal for ALL system operations including:
   Opening files / urls in their default applications(xdotool)
   Window management(wmctrl),
   File operations etc
   Any task that can be accomplished via command line

GuiAgent Tool (Specialized for visual grounding)
Use guiAgent ONLY when you need visual grounding for:
   Unknown coordinates: Moving mouse to visual elements when you don't know exact pixel locations
   Visual identification: Clicking on buttons, links, or UI elements that you can see in screenshots but cannot target via terminal
   Precise visual targeting: Interacting with specific GUI elements that require visual recognition
   Visual feedback required: When you need to visually locate something before interacting with it

 Decision Logic
   Can I do this with a terminal command? → Use Terminal
   Do I need to visually locate something first? → Use GuiAgent
   Must I see it to click it? → Use GuiAgent

Process
-------
1.  Analyze task and current state
2.  Generate todo with checklist
3.  Update plan at each step if deviations occur, noting changes
4.  Complete task and verify success
5.  We will give you desktop screenshot, which may can use to verify the existence of a file

Be concise yet comprehensive. Always use this exact format. Keep responses concise, avoiding unnecessary elaboration.

Additional Notes
----------------
   - Ensure plans include all checkpoints to track progress
   - Update plans dynamically based on feedback or unexpected outcomes
   - Opening a single url in the browser, scrolling up / down, use terminalAgent
   - Filling forms, scrolling web page, finding text - guiAgent
   - Both tools can type and scroll, but if you are sure that the correct element is already focussed call the terminalAgent to type, its more accurate and can type longer texts and handles special characters better than guiAgent.
   - if you are going to go to a link or do something else, tell the terminalAgent what to do, not which app to use for it, it uses xdg-open internally so it will find the right app
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

            // Create all tools using the factory - every tool gets statusCallback and abortController!
            this.tools = this.toolsFactory.createAllTools({
                statusCallback: this.agentStatusCallback!,  // MANDATORY - passed to all tools
                abortController: this.abortController,      // MANDATORY - passed to all tools
                operator: this.operator,
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

            // Build initial messages
            let messages = this.messageBuilder.buildInitialMessages(params.input, initialScreenshot);
            let iteration = 1;

            // Use AI SDK's maxSteps with onStepFinish callback
            const { text, steps } = await generateText({
                model: anthropic('claude-sonnet-4-20250514'),
                messages,
                tools: this.tools,
                maxSteps: params.maxSteps,
                toolChoice: 'auto',
                onStepFinish: async ({ toolCalls, stepType }) => {
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