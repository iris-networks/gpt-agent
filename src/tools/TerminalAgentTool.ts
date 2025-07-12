import { tool, generateText } from 'ai';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { BaseTool } from '../../src/tools/base/BaseTool';
import { AgentStatusCallback } from '../../src/agent_v2/types';
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
        console.log(this.mcpTools)

        console.log(this.mcpTools)
        this.mcpTools.hitlTool = this.hitlTool.getToolDefinition();
        console.log('[BrowserAgent] MCP client initialized with HITL tool support');
    }



    /**
     * Get the system prompt for the terminal agent
     */
    private getSystemPrompt(): string {
        return `You are an elite AI system operator with access to a terminal. Each command executes independently in the /config directory.

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
  

PARALLEL EXECUTION RULES:
   CLI tools: Use (cmd1 & cmd2 & wait) when waiting for completion is necessary
   GUI apps: Launch with & but do not wait
   Default to parallel: Group independent commands with &
   Wait only when output of one is needed by the next

  

WAITING BEHAVIOR:
   WAIT: For CLI commands and dependent steps
   DO NOT WAIT: For GUI apps like mousepad, thunar, xterm

  

OPERATIONAL PHILOSOPHY:
1.  Be surgical with context:
       Use head, tail, grep for previews
       Use wc -l for file sizes
       Use cat for complete reads
2.  Precision manipulation:
       Use sed, awk, cut for editing
       Chain with pipes
3.  Parallelism:
       CLI tools: Use & and wait
       GUI apps: Launch independently
       Example: (grep -r "TODO" /config/src & grep -r "FIXME" /config/src & wait) & mousepad /config/file.txt &
4.  Error handling:
       Stop after three consecutive errors and report`;
    }


    /**
     * Execute natural language instruction by calling the AI model.
     */
    private async executeInstruction(instruction: string, maxSteps: number): Promise<string> {
        try {
            console.log("MCP initializing");
            await this.initializeMCP();

            console.log("MCP initialized");
            const result = await generateText({
                model: google('gemini-2.5-flash'),
                tools: this.mcpTools,
                messages: [
                    {
                        role: 'system',
                        content: this.getSystemPrompt()
                    },
                    {
                        role: 'user',
                        content: `${instruction}\n\nComplete this task in maximum ${maxSteps} steps.`
                    }
                ],
                maxSteps: maxSteps,
                abortSignal: this.abortController.signal
            });

            await this.mcpClient.close();
            return result.text;
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
                `Terminal agent with secure access to unix utilities. Can take upto three tasks at once in natural language achieve those tasks through terminal.`,
            parameters: z.object({
                instruction: z.string().describe(
                    `A high-level command that can be completed through temrinal tools.`
                ),
                maxSteps: z.number().describe('The maximum number of steps it would take a user with terminal access.').min(2).max(10),
            }),
            execute: async ({ instruction, maxSteps }) => this.executeInstruction(instruction, maxSteps),
        });
    }
}