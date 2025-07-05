import { tool, generateText, CoreMessage } from 'ai';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { BaseTool } from './base/BaseTool';
import { AgentStatusCallback } from '../agent_v2/types';
import { StatusEnum } from '@app/packages/ui-tars/shared/src/types';
import { anthropic } from '@ai-sdk/anthropic';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFileSync } from 'fs';
// Note: The pruneImages function and the onStepFinish callback have been removed as they are no longer necessary.

const execAsync = promisify(exec);

interface QutebrowserAgentToolOptions {
    statusCallback: AgentStatusCallback;
    abortController: AbortController;
}

@Injectable()
export class QutebrowserAgentTool extends BaseTool {
    private readonly COMMAND_TIMEOUT_MS = 30000;

    constructor(options: QutebrowserAgentToolOptions) {
        super({
            statusCallback: options.statusCallback,
            abortController: options.abortController,
        });
        console.log('[QuteBrowserAgent] Qutebrowser Agent initialized');
        this.emitStatus(`Qutebrowser Agent initialized`, StatusEnum.RUNNING);
    }


    private pruneImageMessages(messages: CoreMessage[]): CoreMessage[] {
        let imageCount = 0;

        // Process messages in reverse to find newest images first
        return messages.reverse().map(msg => {
            // Skip non-tool messages
            if (msg.role !== 'tool') return msg;

            // Check if message contains an image
            const hasImage = msg.content.some(content =>
                content.type === 'tool-result' &&
                content.toolName === 'takeScreenshot' &&
                Array.isArray(content.result) &&
                content.result.some(item => item.type === 'image')
            );

            if (!hasImage) return msg;

            // Keep only the last 3 images
            if (imageCount < 3) {
                imageCount++;
                return msg;
            }

            // Replace excess images with text placeholder
            return {
                ...msg,
                content: msg.content.map(content => {
                    if (content.type === 'tool-result' && content.toolName === 'takeScreenshot') {
                        return {
                            ...content,
                            result: 'Screenshot removed to save memory'
                        };
                    }
                    return content;
                })
            };
        }).reverse(); // Restore original order
    }

    /**
     * Check if qutebrowser is already running
     */
    private async isQutebrowserRunning(): Promise<boolean> {
        try {
            const { stdout } = await execAsync('ps aux | grep qutebrowser | grep -v grep', {
                env: {
                    ...process.env,
                    DISPLAY: ':1',
                    XDG_RUNTIME_DIR: process.env.IS_CONTAINERIZED ? '/tmp/runtime-root' : process.env.XDG_RUNTIME_DIR
                }
            });
            return stdout.trim().length > 0;
        } catch (error) {
            // This command errors if no process is found, which is the expected outcome.
            return false;
        }
    }

    /**
     * Execute a keyboard command for qutebrowser automation
     */
    private async executeKeyboardCommand(command: string): Promise<string> {
        console.log(`[QuteBrowserAgent] Executing command: ${command}`);
        this.emitStatus(`Executing: ${command}`, StatusEnum.RUNNING);

        try {
            const { stdout, stderr } = await execAsync(command, {
                cwd: '/config',
                timeout: this.COMMAND_TIMEOUT_MS,
                env: {
                    ...process.env,
                    DISPLAY: ':1',
                    XDG_RUNTIME_DIR: process.env.IS_CONTAINERIZED ? '/tmp/runtime-root' : process.env.XDG_RUNTIME_DIR
                }
            });

            let output = '';
            if (stdout.trim()) output += `STDOUT:\n${stdout.trim()}`;
            if (stderr.trim()) output += `\nSTDERR:\n${stderr.trim()}`;

            const result = output || 'Command executed successfully.';
            console.log(`[QuteBrowserAgent] Command result: ${result}`);
            return result;

        } catch (error: any) {
            const errorMsg = `Error executing command "${command}": ${error.message}`;
            console.error(`[QuteBrowserAgent] ${errorMsg}`);
            // Return the error so the model can see what went wrong.
            return errorMsg;
        }
    }

    /**
     * Take screenshot using scrot targeting QuteBrowser window
     */
    private async takeQutebrowserScreenshot(): Promise<string> {
        const screenshotPath = `/tmp/qutebrowser_screenshot_${Date.now()}.png`;
        console.log(`[QuteBrowserAgent] Taking screenshot: ${screenshotPath}`);

        try {
            await execAsync(`scrot -u -q 100 "${screenshotPath}"`, {
                timeout: 5000,
                env: {
                    ...process.env,
                    DISPLAY: ':1',
                    XDG_RUNTIME_DIR: process.env.IS_CONTAINERIZED ? '/tmp/runtime-root' : process.env.XDG_RUNTIME_DIR
                }
            });

            const screenshotBuffer = readFileSync(screenshotPath);
            // Fire and forget cleanup
            execAsync(`rm "${screenshotPath}"`).catch(() => { });

            console.log(`[QuteBrowserAgent] Screenshot captured successfully`);
            return screenshotBuffer.toString('base64');
        } catch (error) {
            const errorMsg = `Failed to take screenshot: ${error.message}`;
            console.error(`[QuteBrowserAgent] ${errorMsg}`);
            // Propagate the error to be handled by the main loop
            throw new Error(errorMsg);
        }
    }

    /**
     * Execute browser automation instruction
     */
    private async executeBrowserInstruction(instruction: string): Promise<string> {
        console.log(`[QuteBrowserAgent] Processing browser instruction: "${instruction}"`);
        this.emitStatus(`Processing browser instruction: "${instruction}"`, StatusEnum.RUNNING);

        const isRunning = await this.isQutebrowserRunning();
        if (!isRunning) {
            console.log('[QuteBrowserAgent] Qutebrowser not running, launching...');
            const launchCommand = 'qutebrowser :open about:blank &';
            execAsync(launchCommand, {
                cwd: '/config',
                env: { ...process.env, DISPLAY: ':1', XDG_RUNTIME_DIR: process.env.IS_CONTAINERIZED ? '/tmp/runtime-root' : process.env.XDG_RUNTIME_DIR }
            }).catch(error => {
                // This catch is expected for background processes. Log for info.
                console.log(`[QuteBrowserAgent] Browser launch command completed (this is expected): ${error.message}`);
            });

            await new Promise(resolve => setTimeout(resolve, 5000)); // Increased wait time
            console.log('[QuteBrowserAgent] Qutebrowser launched.');
        }

        // CORRECTED: A clear, reactive system prompt that teaches the correct behavior.
        const systemPrompt = `You are an expert qutebrowser automation agent. Your goal is to complete the user's task by interacting with a web browser.
You operate in a strict, reactive loop:
1.  **Decide on an action** (e.g., navigate, show hints, type text).
2.  **Execute the action** using a tool call (\`executeCommand\`).
3.  **Observe the result** by taking a screenshot (\`takeScreenshot\`).
4.  **Analyze the image** from the screenshot to decide your next action. Repeat.

**EXAMPLE of your thought process for "Search Google for 'AI SDK' and click the first result":**
1.  **Thought:** I need to start by opening Google.
    **Tool Call:** \`executeCommand({ command: "qutebrowser ':open https://google.com'" })\`
2.  **Thought:** Now that the page should be open, I need to see it to find the search bar.
    **Tool Call:** \`takeScreenshot({})\`
3.  **Thought:** (After seeing the screenshot) Okay, I see the Google homepage. To find the search bar, I need to display the interaction hints.
    **Tool Call:** \`executeCommand({ command: "qutebrowser ':hint'" })\`
4.  **Thought:** The hints are now displayed. I must take another screenshot to see what alphabetic label corresponds to the search bar.
    **Tool Call:** \`takeScreenshot({})\`
5.  **Thought:** (After seeing the new screenshot with hint labels) The image shows the search bar has the alphabetic hint label 'af'. I will follow that hint to activate it.
    **Tool Call:** \`executeCommand({ command: "qutebrowser ':hint-follow af'" })\`
6.  **Thought:** The search bar is now active. I need to type the search query.
    **Tool Call:** \`executeCommand({ command: "qutebrowser ':insert-text AI SDK'" })\`
7.  **Thought:** The query is typed. I will now press Enter to submit the search.
    **Tool Call:** \`executeCommand({ command: "qutebrowser ':fake-key <Return>'" })\`
8.  **Thought:** The search results page should be loading. I need a screenshot to see the results and finish the task.
    **Tool Call:** \`takeScreenshot({})\`
9.  **Thought:** I have successfully navigated to the search results page. The task is complete.n

**Available Commands:**

**Navigation:**
- \`qutebrowser ':open URL'\`: Navigate to a specific webpage (e.g., :open https://www.google.com)
- \`qutebrowser ':back'\`: Navigate back in tab history
- \`qutebrowser ':forward'\`: Navigate forward in tab history  
- \`qutebrowser ':reload'\`: Refresh the current page

**Tab Management:**
- \`qutebrowser ':tab-new'\`: Open a new tab
- \`qutebrowser ':tab-close'\`: Close the current tab
- \`qutebrowser ':tab-focus INDEX'\`: Switch to tab by index or partial URL/title match
- \`qutebrowser ':tab-clone'\`: Duplicate the current tab

**Page Interaction:**
- \`qutebrowser ':hint'\`: Display alphabetic labels (a, b, c, aa, ab, etc.) on clickable elements. ALWAYS take screenshot after to see labels.
- \`qutebrowser ':hint-follow X'\`: Click element with alphabetic hint label X. Must know label from screenshot.
- \`qutebrowser ':search TEXT'\`: Find text on current page (like Ctrl+F)
- \`qutebrowser ':search-next'\`: Continue search to next occurrence
- \`qutebrowser ':search-prev'\`: Continue search to previous occurrence
- \`qutebrowser ':insert-text TEXT'\`: Insert text at cursor position (for forms/input fields)
- \`qutebrowser ':fake-key <Return>'\`: Press Enter key (note: angle brackets required)
- \`qutebrowser ':fake-key <Escape>'\`: Press Escape key  
- \`qutebrowser ':fake-key <Ctrl-x>'\`: Send Ctrl+x combination
- \`qutebrowser ':fake-key <Tab>'\`: Press Tab key
- \`qutebrowser ':fake-key xy'\`: Send keychain 'xy' (for simple key sequences)

**Scrolling:**
- \`qutebrowser ':scroll DIRECTION'\`: Scroll in direction (up/down/left/right/top/bottom)
- \`qutebrowser ':scroll-page X Y'\`: Scroll page-wise (X pages right, Y pages down)
- \`qutebrowser ':scroll-px DX DY'\`: Scroll by specific pixels (e.g., :scroll-px 0 100)
- \`qutebrowser ':scroll-to-anchor NAME'\`: Scroll to specific anchor in document
- \`qutebrowser ':scroll-to-perc PERCENT'\`: Scroll to percentage of page (0-100)

**Text Selection:**
- \`qutebrowser ':selection-follow'\`: Follow/click the selected text

**Data Extraction:**
- \`qutebrowser 'yank title'\`: Copy page title to clipboard
- \`qutebrowser 'yank selection'\`: Copy selected text to clipboard
- \`qutebrowser 'v'\`: Enter visual mode for text selection

**CRITICAL: ALL commands must start with 'qutebrowser'. 
Examples:**
- CORRECT: qutebrowser ':open https://google.com'
- WRONG: ':open https://google.com'
- CORRECT: qutebrowser ':hint'
- WRONG: ':hint'
- CORRECT: qutebrowser ':fake-key <Return>'
- WRONG: ':fake-key <Return>'
- CORRECT: qutebrowser ':fake-key <Ctrl-c>'
- WRONG: qutebrowser ':fake-key Ctrl-c' (missing angle brackets)

Your final output should be a summary of what you accomplished. Now, begin the task.`;

        try {
              const messages: CoreMessage[] = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: instruction }
            ];

            const { text } = await generateText({
                model: anthropic('claude-sonnet-4-20250514'), // Using your specified model
                system: systemPrompt,
                messages: this.pruneImageMessages(messages),
                maxSteps: 25, // Increased steps for more complex tasks
                tools: {
                    executeCommand: tool({
                        description: 'Execute a qutebrowser command for browser automation.',
                        parameters: z.object({
                            command: z.string().describe('The qutebrowser command to execute. MUST start with "qutebrowser".'),
                        }),
                        execute: async ({ command }) => this.executeKeyboardCommand(command),
                    }),
                    takeScreenshot: tool({
                        description: 'Take a screenshot of the current browser window to see the visual state and any hint labels.',
                        parameters: z.object({}),
                        execute: async () => this.takeQutebrowserScreenshot(),
                        experimental_toToolResultContent: image => [{ type: 'image', data: image, mimeType: 'image/png' }]
                    })
                },
                toolChoice: 'auto',
                abortSignal: this.abortController.signal,
            });

            const summary = text || "Browser automation task completed successfully.";
            console.log(`[QuteBrowserAgent] Browser instruction completed. Final summary: ${summary}`);
            this.emitStatus(summary, StatusEnum.RUNNING);
            return summary;
        } catch (error: any) {
            console.error(`[QuteBrowserAgent] Critical error in generateText loop:`, error);
            const errorMessage = `Error processing browser instruction: ${error.message}`;
            this.emitStatus(errorMessage, StatusEnum.ERROR);
            return errorMessage;
        }
    }

    /**
     * Get the AI SDK tool definition for the qutebrowser agent
     */
    getToolDefinition() {
        return tool({
            description: 'Browser automation agent that can perform multi-step browser automations like searching, navigating, and clicking elements.',
            parameters: z.object({
                instruction: z.string().describe(
                    'The detailed task for the browser agent to perform. Example: "Go to github.com, find the search bar, and search for `vercel/ai`."'
                ),
            }),
            execute: async ({ instruction }) => {
                // CORRECTED: Ensure the result of the execution is returned.
                const result = await this.executeBrowserInstruction(instruction);
                return result;
            },
        });
    }
}