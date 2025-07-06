import { generateObject, CoreMessage, tool } from 'ai';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { BaseTool } from './base/BaseTool';
import { StatusEnum } from '@app/packages/ui-tars/shared/src/types';
import { QutebrowserAgentToolOptions } from './interfaces/qutebrowser-interfaces';
import { QutebrowserUtils } from './utils/qutebrowser-utils';
import { QutebrowserScreenshotService } from './services/qutebrowser-screenshot';
import { QutebrowserMessagePruner } from './services/qutebrowser-message-pruner';
import { sleep } from 'openai/core';
import { google } from '@ai-sdk/google';

export interface AgentResult {
    summary: string;
}

// ---- CONFIGURATION ----
const agentConfig = {
    delays: {
        navigation: 3000, // ms to wait after commands like :open, :back, :reload
        interaction: 1000, // ms to wait after commands like :insert-text, :hint-follow
    },
    maxSteps: 15, // Max number of LLM calls to prevent infinite loops
};


// ---- ZOD SCHEMA & PROMPT ----

// Schema for a single command step
const commandStepSchema = z.object({
    command: z.string().describe('A single qutebrowser command. MUST start with a colon ":".'),
});

// New schema for a planned sequence of actions
const planSchema = z.object({
    action: z.enum(['execute', 'finish'])
        .describe(`'execute' to run the steps and continue, 'finish' to end the task.`),
    thought: z.string()
        .describe('Your reasoning for the plan. For the "finish" action, this will be used as the final summary.'),
    wittyMessage: z.string()
        .describe('A short, funny, and cryptic message to display to the user that obscures what you are actually doing. Be creative and humorous but keep it brief. Use emojis.'),
    steps: z.array(commandStepSchema).optional()
        .describe('A sequence of qutebrowser commands to execute in order.'),
}).superRefine((data, ctx) => {
    if (data.action === 'execute' && (!data.steps || data.steps.length === 0)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'The `steps` array is required and must not be empty when action is "execute".',
            path: ['steps'],
        });
    }
});


// New system prompt defined above
// const systemPrompt = `...`;

@Injectable()
export class QutebrowserAgentTool extends BaseTool {
    constructor(options: QutebrowserAgentToolOptions) {
        super({
            statusCallback: options.statusCallback,
            abortController: options.abortController,
        });
        console.log(`[QuteBrowserAgent] Qutebrowser Agent initialized.`);
        this.emitStatus(`🤖 Browser agent ready for action`, StatusEnum.RUNNING);
    }

    private getDelayForCommand(command: string): number {
        const navigationCommands = [':open', ':back', ':forward', ':reload'];
        if (navigationCommands.some(navCmd => command.startsWith(navCmd))) {
            return agentConfig.delays.navigation;
        }
        return agentConfig.delays.interaction;
    }

    private async executeBrowserInstruction(instruction: string): Promise<AgentResult> {
        console.log(`[QuteBrowserAgent] Processing browser instruction: "${instruction}"`);
        this.emitStatus(`🎯 Starting browser mission...`, StatusEnum.RUNNING);

        const isRunning = await QutebrowserUtils.isQutebrowserRunning();
        if (!isRunning) {
            this.emitStatus(`🚀 Launching browser into digital space...`, StatusEnum.RUNNING);
            await QutebrowserUtils.launchQutebrowser();
            // Give it time to fully initialize
            await sleep(5000);
            console.log('[QuteBrowserAgent] Qutebrowser launched.');
        }

        try {
            const messages: CoreMessage[] = [{ role: 'user', content: instruction }];

            for (let i = 0; i < agentConfig.maxSteps; i++) {
                if (this.abortController.signal.aborted) {
                    const abortMessage = 'Browser automation was aborted by the user.';
                    console.log(`[QuteBrowserAgent] ${abortMessage}`);
                    this.emitStatus(`🛑 Mission aborted by human commander`, StatusEnum.ERROR);
                    return { summary: abortMessage };
                }

                console.log(`[QuteBrowserAgent] Step ${i + 1}/${agentConfig.maxSteps}`);
                // Skip planning status - wittyMessage from LLM will be used instead

                const { object: plan } = await generateObject({
                    model: google('gemini-2.5-flash'),
                    system: QutebrowserUtils.SYSTEM_PROMPT,
                    messages: QutebrowserMessagePruner.pruneImageMessages(messages),
                    schema: planSchema,
                    abortSignal: this.abortController.signal,
                });

                // Display the witty message to the user
                this.emitStatus(plan.wittyMessage, StatusEnum.RUNNING);

                if (plan.action === 'finish') {
                    console.log(`[QuteBrowserAgent] AI decided to finish. Summary: ${plan.thought}`);
                    this.emitStatus(plan.thought, StatusEnum.RUNNING);
                    return { summary: plan.thought };
                }

                // If we are here, action is 'execute'
                const executedCommands: string[] = [];
                let assistantResponseText = `Thought: ${plan.thought}\nExecuting plan:\n`;
                
                for (const step of plan.steps!) {
                    const command = step.command;
                    console.log(`[QuteBrowserAgent] Executing: ${command}`);
                    // Skip individual command status - wittyMessage covers the whole plan

                    const commandResult = await QutebrowserUtils.executeKeyboardCommand(
                        command,
                        (msg) => {/* Skip callback messages */}
                    );
                    
                    executedCommands.push(command);
                    assistantResponseText += `- \`${command}\`\n`;

                    // Add a delay after each command to let the browser catch up
                    const delay = this.getDelayForCommand(command);
                    console.log(`[QuteBrowserAgent] Waiting for ${delay}ms...`);
                    await sleep(delay);
                }
                messages.push({ role: 'assistant', content: assistantResponseText });

                // After executing the whole plan, take a screenshot to observe the result
                console.log(`[QuteBrowserAgent] Plan executed. Taking a screenshot.`);
                const base64Image = await QutebrowserScreenshotService.takeQutebrowserScreenshot();
                messages.push({
                    role: 'user',
                    content: [
                        { type: 'text', text: 'This is the screenshot after executing the previous plan.' },
                        { type: 'image', image: base64Image, mimeType: "image/png" }
                    ]
                });
            }

            const timeoutMessage = `Browser automation task timed out after ${agentConfig.maxSteps} steps.`;
            console.log(`[QuteBrowserAgent] ${timeoutMessage}`);
            this.emitStatus(`⏰ Browser adventure timed out after too many steps`, StatusEnum.ERROR);
            return { summary: timeoutMessage };

        } catch (error: any) {
            console.error(`[QuteBrowserAgent] Critical error in agent loop:`, error);
            const errorMessage = `Error processing browser instruction: ${error.message}`;
            this.emitStatus(`💥 Browser encountered a mysterious glitch`, StatusEnum.ERROR);
            return { summary: errorMessage };
        }
    }

    getToolDefinition() {
        return tool({
            description: 'Browser automation agent that can perform multi-step browser automations like searching, navigating, and clicking elements.',
            parameters: z.object({
                instruction: z.string().describe(
                    'The detailed task for the browser agent to perform. Example: "Go to github.com, search for `vercel/ai`, and click on the main repository link."'
                ),
            }),
            execute: async ({ instruction }) => {
                console.log("Received instruction....")
                return await this.executeBrowserInstruction(instruction);
            },
        });
    }
}