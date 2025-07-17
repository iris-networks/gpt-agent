import { tool, streamText } from 'ai';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { BaseTool } from './base/BaseTool';
import { AgentStatusCallback } from '../agent_v2/types';
import { StatusEnum } from '@app/packages/ui-tars/shared/src/types';
import * as os from 'os';
import { HITLTool } from './HITLTool';
import { google } from '@ai-sdk/google';
import {
    experimental_createMCPClient as createMCPClient,
} from 'ai';
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

interface TerminalAgentToolOptions {
    statusCallback: AgentStatusCallback;
    abortController: AbortController;
    mcpServerUrl?: string;
}

@Injectable()
export class TerminalAgentTool extends BaseTool {
    private mcpTools: any;
    private hitlTool: HITLTool;
    private mcpClient = null;
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
        this.emitStatus(`Terminal Agent initialized`, StatusEnum.RUNNING);
    }


    private async initializeMCP() {
        const mcpClient = await createMCPClient({
            transport: new StdioClientTransport({
                command: "sudo",
                args: ["-u", "abc", "bash", "-c", "cd $HOME && DISPLAY=:1 mcp-terminal-server"],
            }),
        });
        this.mcpClient = mcpClient;
        this.mcpTools = await mcpClient.tools();
        this.mcpTools.hitlTool = this.hitlTool.getToolDefinition();
        console.log('[TerminalAgent] MCP client initialized with HITL tool support');
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
- ALWAYS use '&' at the end of commands that launch GUI applications or terminals
- NEVER wait for GUI applications to complete - launch and move on
- Use 'nohup' for long-running processes: nohup command &
- Use 'disown' after background processes: command & disown
- For multiple applications: (app1 & app2 & app3 &) - all in background

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
            console.log("MCP initializing");
            await this.initializeMCP();

            const result = streamText({
                model: google('gemini-2.5-flash'),
                tools: this.mcpTools,
                messages: [
                    {
                        role: 'system',
                        content: this.getSystemPrompt()
                    },
                    {
                        role: 'user',
                        content: `${instruction}`
                    }
                ],
                maxSteps: maxSteps,
                abortSignal: this.abortController.signal
            });

            let fullText = '';
            for await (const textPart of result.textStream) {
                fullText += textPart;
            }
            
            await this.mcpClient.close();
            return fullText;
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