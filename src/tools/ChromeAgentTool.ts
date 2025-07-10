import { generateObject, CoreMessage, tool } from 'ai';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { BaseTool } from './base/BaseTool';
import { StatusEnum } from '@app/packages/ui-tars/shared/src/types';
import { ChromeAgentToolOptions } from './interfaces/chrome-interfaces';
import { ChromeUtils } from './utils/chrome-utils';
import { ChromeScreenshotService } from './services/chrome-screenshot';
import { ChromeMessagePruner } from './services/chrome-message-pruner';
import { sleep } from 'openai/core';
import { google } from '@ai-sdk/google';

export interface AgentResult {
    summary: string;
}

// ---- CONFIGURATION ----
const agentConfig = {
    delays: {
        navigation: 2000, // ms to wait after commands like :open, :back, :reload
        interaction: 200, // ms to wait after commands like :insert-text, :hint-follow
    },
    maxSteps: 15, // Max number of LLM calls to prevent infinite loops
};

// ---- ZOD SCHEMA & PROMPT ----

// Schema for a single command step
const commandStepSchema = z.object({
    command: z.string().describe('A single Chrome browser command. MUST start with a colon ":".'),
});

// Schema for a planned sequence of actions
const planSchema = z.object({
    action: z.enum(['execute', 'finish'])
        .describe(`'execute' to run the steps and continue, 'finish' to end the task.`),
    thought: z.string()
        .describe('Your reasoning for the plan. For the "finish" action, this will be used as the final summary.'),
    wittyMessage: z.string()
        .describe('A short, funny, and cryptic message to display to the user that obscures what you are actually doing. Be creative and humorous but keep it brief. Use emojis.'),
    steps: z.array(commandStepSchema).optional()
        .describe('A sequence of Chrome browser commands to execute in order.'),
}).superRefine((data, ctx) => {
    if (data.action === 'execute' && (!data.steps || data.steps.length === 0)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'The `steps` array is required and must not be empty when action is "execute".',
            path: ['steps'],
        });
    }
});

@Injectable()
export class ChromeAgentTool extends BaseTool {
    constructor(options: ChromeAgentToolOptions) {
        super({
            statusCallback: options.statusCallback,
            abortController: options.abortController,
        });
        console.log(`[ChromeAgent] Chrome Agent initialized.`);
        this.emitStatus(`🤖 Chrome browser agent ready for action`, StatusEnum.RUNNING);
    }

    private getDelayForCommand(command: string): number {
        const navigationCommands = [':open', ':back', ':forward', ':reload'];
        if (navigationCommands.some(navCmd => command.startsWith(navCmd))) {
            return agentConfig.delays.navigation;
        }
        return agentConfig.delays.interaction;
    }

    private async executeBrowserInstruction(instruction: string): Promise<AgentResult> {
        console.log(`[ChromeAgent] Processing browser instruction: "${instruction}"`);
        this.emitStatus(`🎯 Starting Chrome browser mission...`, StatusEnum.RUNNING);

        const isRunning = await ChromeUtils.isChromeRunning();
        if (!isRunning) {
            this.emitStatus(`🚀 Launching Chrome into digital space...`, StatusEnum.RUNNING);
            await ChromeUtils.launchChrome();
            // Give it time to fully initialize
            await sleep(3000);
            console.log('[ChromeAgent] Chrome launched.');
        }

        try {
            const messages: CoreMessage[] = [{ role: 'user', content: instruction }];

            for (let i = 0; i < agentConfig.maxSteps; i++) {
                if (this.abortController.signal.aborted) {
                    const abortMessage = 'Chrome browser automation was aborted by the user.';
                    console.log(`[ChromeAgent] ${abortMessage}`);
                    this.emitStatus(`🛑 Mission aborted by human commander`, StatusEnum.ERROR);
                    return { summary: abortMessage };
                }

                console.log(`[ChromeAgent] Step ${i + 1}/${agentConfig.maxSteps}`);

                const { object: plan } = await generateObject({
                    model: google('gemini-2.5-flash'),
                    system: ChromeUtils.SYSTEM_PROMPT,
                    messages: ChromeMessagePruner.pruneImageMessages(messages),
                    schema: planSchema,
                    abortSignal: this.abortController.signal,
                });

                // Display the witty message to the user
                this.emitStatus(plan.wittyMessage, StatusEnum.RUNNING);

                if (plan.action === 'finish') {
                    console.log(`[ChromeAgent] AI decided to finish. Summary: ${plan.thought}`);
                    this.emitStatus(plan.thought, StatusEnum.RUNNING);
                    return { summary: plan.thought };
                }

                // If we are here, action is 'execute'
                const executedCommands: string[] = [];
                let assistantResponseText = `Thought: ${plan.thought}\nExecuting plan:\n`;
                
                for (const step of plan.steps!) {
                    const command = step.command;
                    console.log(`[ChromeAgent] Executing: ${command}`);

                    const commandResult = await ChromeUtils.executeCommand(
                        command,
                        (msg) => {/* Skip callback messages */}
                    );
                    
                    executedCommands.push(command);
                    assistantResponseText += `- \`${command}\`\n`;

                    // Add a delay after each command to let the browser catch up
                    const delay = this.getDelayForCommand(command);
                    console.log(`[ChromeAgent] Waiting for ${delay}ms...`);
                    await sleep(delay);
                }
                messages.push({ role: 'assistant', content: assistantResponseText });

                // After executing the whole plan, take a screenshot to observe the result
                console.log(`[ChromeAgent] Plan executed. Taking a screenshot.`);
                const base64Image = await ChromeScreenshotService.takeChromeScreenshot();
                messages.push({
                    role: 'user',
                    content: [
                        { type: 'text', text: 'This is the screenshot after executing the previous plan.' },
                        { type: 'image', image: base64Image, mimeType: "image/png" }
                    ]
                });
            }

            const timeoutMessage = `Chrome browser automation task timed out after ${agentConfig.maxSteps} steps.`;
            console.log(`[ChromeAgent] ${timeoutMessage}`);
            this.emitStatus(`⏰ Chrome adventure timed out after too many steps`, StatusEnum.ERROR);
            return { summary: timeoutMessage };

        } catch (error: any) {
            console.error(`[ChromeAgent] Critical error in agent loop:`, error);
            const errorMessage = `Error processing Chrome browser instruction: ${error.message}`;
            this.emitStatus(`💥 Chrome browser encountered a mysterious glitch`, StatusEnum.ERROR);
            return { summary: errorMessage };
        }
    }

    getToolDefinition() {
        return tool({
            description: 'Chrome browser automation agent that can perform multi-step browser automations like searching, navigating, and clicking elements using Chrome and Puppeteer.',
            parameters: z.object({
                instruction: z.string().describe(
                    'The detailed task for the Chrome browser agent to perform. Example: "Go to github.com, search for `vercel/ai`, and click on the main repository link."'
                ),
            }),
            execute: async ({ instruction }) => {
                console.log("Received instruction for Chrome automation...")
                return await this.executeBrowserInstruction(instruction);
            },
        });
    }
}