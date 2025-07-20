import { tool, streamText, CoreMessage } from 'ai';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { BaseTool } from './base/BaseTool';
import { AgentStatusCallback } from '../agent_v2/types';
import { StatusEnum } from '@app/packages/ui-tars/shared/src/types';
import * as os from 'os';
import { HITLTool } from './HITLTool';
import { google } from '@ai-sdk/google';
import { exec } from 'child_process';
import { promisify } from 'util';

interface TerminalAgentToolOptions {
    statusCallback: AgentStatusCallback;
    abortController: AbortController;
}

const execAsync = promisify(exec);

@Injectable()
export class TerminalAgentTool extends BaseTool {
    private hitlTool: HITLTool;
    private platform = null;

    constructor(options: TerminalAgentToolOptions) {
        super({
            statusCallback: options.statusCallback,
            abortController: options.abortController,
        });
        this.hitlTool = new HITLTool({
            statusCallback: options.statusCallback,
            abortController: options.abortController,
        });
        this.platform = os.platform();
    }


    private async executeCommand(command: string): Promise<{ stdout: string; stderr: string }> {
        try {
            this.emitStatus(`Executing: ${command}`, StatusEnum.RUNNING);
            const result = await execAsync(command, {
                timeout: 30000,
                maxBuffer: 1024 * 1024 // 1MB buffer
            });
            this.emitStatus(`Command completed: ${command}`, StatusEnum.RUNNING);
            return result;
        } catch (error) {
            this.emitStatus(`Command failed: ${command} - ${error.message}`, StatusEnum.ERROR);
            return { stdout: '', stderr: error.message };
        }
    }



    /**
     * Get the system prompt for the terminal agent
     */
    private getSystemPrompt(): string {
        const isContainerized = process.env.IS_CONTAINERIZED == 'true';
        console.log({ isContainerized })
        const baseDir = isContainerized ? '/config' : `${os.homedir()}/.iris`;
        const workingDir = `${baseDir}/files`;
        const downloadsDir = `${baseDir}/Downloads`;
        return `You are an AI agent with access to a headless terminal.

PREFERRED DIRECTORY LOCATIONS:
- Base directory: ${baseDir}
- Working directory: ${workingDir} (preferred for file operations)
- Downloads: ${downloadsDir}

RECOMMENDED INITIALIZATION:
Start by running: cd ${baseDir} && pwd
This ensures you're in the correct working location.

FILE OPERATION PREFERENCES:
- File searches: find ${workingDir} -name "filename"
- File reads: cat ${workingDir}/filename
- File writes: > ${workingDir}/filename
- File edits: sed -i 's/old/new/g' ${workingDir}/filename
- When creating files: mkdir -p ${workingDir} && touch ${workingDir}/filename

AVAILABLE CLI PROGRAMS: Standard Unix utilities:
 ls, cat, head, tail, find, grep, sed, awk, cut, sort, uniq, mkdir, mv, cp, rm, tar, gzip
 ps, kill, top, df, du, mount, ssh, scp, systemctl, service
 git, npm, node, python3, make, cmake, gcc, g++, perl
 curl, nginx
 ffmpeg, convert, mogrify, identify, montage
 wmctrl, xdg-open, xrandr, xset, xprop, xwininfo
 mousepad
 thunar
 xterm, uxterm, lxterm
 xdotool for scroll and type

BACKGROUND EXECUTION RULES - CRITICAL:
- NEVER wait for GUI applications to complete - launch and move on
- Use 'nohup' for long-running processes: nohup command &
- Use 'disown' after background processes: command & disown
- For multiple applications with dependencies: cd /path && (app1 & app2 & app3 &) - all in background after cd completes
- For sequential background tasks: (cd /path && { app1 && sleep 1 && app2 && sleep 1 && app3; } || echo "Task failed") & - execute in order with delays
COMMAND EXECUTION PHILOSOPHY:
1. Background First: Every GUI app, file opener, or terminal gets '&'
2. No Hanging: Never wait for interactive applications
3. Clean Launch: Use proper background patterns

EXAMPLES - ALWAYS BACKGROUND:
Open file: xdg-open filename.txt &
Open directory: xdg-open /path/dir &
Launch terminal: xterm &
Open multiple: (xdg-open file1.txt & xdg-open file2.txt & xdg-open dir/ &)
Start app: myapp --args &

PARALLEL EXECUTION:
CLI tools: Use (cmd1 & cmd2 & wait) when waiting for completion is necessary
GUI apps: Launch with & but do not wait
Default to parallel: Group independent commands with &

WAITING BEHAVIOR:
WAIT: For CLI commands and dependent steps
DO NOT WAIT: For GUI apps opened with xdg-open or terminal applications

OPERATIONAL PHILOSOPHY:
1. Directory awareness: Start operations from ${baseDir} when possible
2. Be surgical with context: Use head, tail, grep for previews, wc -l for file sizes
3. Precision manipulation: Use sed, awk, cut for editing, chain with pipes
4. Background execution: Launch GUI apps with & always
5. File operations: Prefer creating files in ${workingDir}
6. Error handling: Stop after three consecutive errors and report

ESSENTIAL EXAMPLES:

File Management with Background Apps:
User: "Create a new file and open it"
Response: cd ${baseDir} && echo "content" > ${workingDir}/newfile.txt && xdg-open ${workingDir}/newfile.txt &

User: "Search for files and open results directory"
Response: cd ${baseDir} && find ${workingDir} -name "*.txt" -exec grep -l "TODO" {} \; && xdg-open ${workingDir} &

User: "Open multiple applications"
Response: cd ${baseDir} && (xterm & thunar & mousepad &)

User: "Start a development server and open browser"
Response: cd ${baseDir} && nohup npm start & disown && sleep 2 && xdg-open http://localhost:3000 &

App Opening/Closing:
User: "Open several files for editing"
Response: cd ${baseDir} && (xdg-open ${workingDir}/file1.txt & xdg-open ${workingDir}/file2.txt &)

User: "Kill a running application"
Response: cd ${baseDir} && pkill -f "application_name"

BACKGROUND EXECUTION MANDATE:
Every command that opens a GUI, file manager, or interactive application MUST end with &
This prevents the terminal from hanging on one application.`;
    }

    /**
     * Execute natural language instruction by calling the AI model.
     */
    private async executeInstruction(instruction: string, maxSteps: number): Promise<string> {
        try {
            const tools = {
                executeCommand: tool({
                    description: 'Execute a terminal command and get the output',
                    parameters: z.object({
                        command: z.string().describe('The terminal command to execute'),
                    }),
                    execute: async ({ command }) => {
                        const output = await this.executeCommand(command);
                        return {
                            command,
                            stdout: output.stdout,
                            stderr: output.stderr,
                            success: !output.stderr
                        };
                    },
                }),
                hitlTool: this.hitlTool.getToolDefinition(),
            };

            const result = streamText({
                model: google('gemini-2.5-flash'),
                tools,
                maxSteps,
                messages: [
                    {
                        role: 'system',
                        content: this.getSystemPrompt() + `

You have access to the following tools:
- executeCommand: Execute terminal commands and get their output
- hitlTool: Ask for human input when needed

Use the executeCommand tool to run terminal commands. You can run multiple commands in sequence to complete the task.
`
                    },
                    {
                        role: 'user',
                        content: `MANDATORY BACKGROUND EXECUTION: ${instruction}

CRITICAL REMINDER: Every command that opens GUI applications, file managers, or interactive applications MUST end with '&' to run in background. This is non-negotiable and prevents terminal hanging.

Please complete this task using the available tools.`
                    }
                ],
                abortSignal: this.abortController.signal
            });

            let fullOutput = '';

            // Stream the text and emit status updates
            for await (const textPart of result.textStream) {
                fullOutput += textPart;
                this.emitStatus(`AI Response: ${textPart}`, StatusEnum.RUNNING);
            }

            return fullOutput;
        } catch (error) {
            this.emitStatus(`Error executing instruction: ${error.message}`, StatusEnum.ERROR);
            return `Error: ${error.message}`;
        }
    }

    /**
     * Get the AI SDK tool definition for the "wild" agent.
     */
    getToolDefinition() {
        return tool({
            description:
                `Terminal agent with secure access to unix utilities. Can take upto three tasks at once in natural language achieve those tasks through terminal, open desktop files, search, find, open applications etc. Should be preferred over guiAgent`,
            parameters: z.object({
                instruction: z.string().describe(
                    `A high-level command that can be completed through terminal utilities.`
                ),
                maxSteps: z.number().describe('The maximum number of steps it would take a user with terminal access.').min(2).max(10),
            }),
            execute: async ({ instruction, maxSteps }) => this.executeInstruction(instruction, maxSteps),
        });
    }
}