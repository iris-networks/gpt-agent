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
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

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
        const url = new URL('http://localhost:8080/mcp');
        const mcpClient = await createMCPClient({
            transport: new StreamableHTTPClientTransport(url, {
                sessionId: 'session_123',
            }),
        });
        this.mcpClient = mcpClient;
        this.mcpTools = await mcpClient.tools();
        this.mcpTools.hitlTool = this.hitlTool.getToolDefinition();
        console.log('[BrowserAgent] MCP client initialized with HITL tool support');
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

When opening files or directories, use xdg-open, so files open in their default applications

PARALLEL EXECUTION RULES:
 CLI tools: Use (cmd1 & cmd2 & wait) when waiting for completion is necessary
 GUI apps: Launch with & but do not wait (use xdg-open for file/directory opening)
 Default to parallel: Group independent commands with &
 Wait only when output of one is needed by the next

WAITING BEHAVIOR:
 WAIT: For CLI commands and dependent steps
 DO NOT WAIT: For GUI apps opened with xdg-open or terminal applications like xterm

OPERATIONAL PHILOSOPHY:
1. Directory awareness: Start operations from ${baseDir} when possible
2. Be surgical with context:
 Use head, tail, grep for previews
 Use wc -l for file sizes
 Use cat for complete reads
3. Precision manipulation:
 Use sed, awk, cut for editing
 Chain with pipes
4. Parallelism:
 CLI tools: Use & and wait
 GUI apps: Launch independently with xdg-open
 Example: (grep -r "TODO" ${workingDir}/src & grep -r "FIXME" ${workingDir}/src & wait) & xdg-open ${workingDir}/file.txt &
5. File operations:
 Prefer creating files in ${workingDir}
 Use ${baseDir} as the base directory when needed
6. Error handling:
 Stop after three consecutive errors and report

ESSENTIAL EXAMPLES:

File Management:
User: "Create a new file and open it"
Response: cd ${baseDir} && echo "content" > ${workingDir}/newfile.txt && xdg-open ${workingDir}/newfile.txt &

User: "Search for files containing 'TODO'"
Response: cd ${baseDir} && find ${workingDir} -name "*.txt" -exec grep -l "TODO" {} \; && xdg-open ${workingDir} &

User: "Open a directory for browsing"
Response: cd ${baseDir} && xdg-open ${workingDir} &

App Opening/Closing:
User: "Open multiple files for editing"
Response: cd ${baseDir} && (xdg-open ${workingDir}/file1.txt & xdg-open ${workingDir}/file2.txt &)

User: "Kill a running application"
Response: cd ${baseDir} && pkill -f "application_name"

HELPFUL TIPS:
- Use ${baseDir} as your home base for operations
- The working directory ${workingDir} is organized for your file operations
- Always use xdg-open to open files and directories - it will use the default application
- Always launch GUI applications with & to run them in background
- Group CLI commands with & and wait when their output is needed
- Use xdg-open for files/directories, xterm for terminals
- Create directory structures before writing files to avoid errors`;
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