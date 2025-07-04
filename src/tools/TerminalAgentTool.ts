import { tool, generateText } from 'ai';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { BaseTool } from '../../src/tools/base/BaseTool';
import { AgentStatusCallback } from '../../src/agent_v2/types';
import { StatusEnum } from '@app/packages/ui-tars/shared/src/types';
import { anthropic } from '@ai-sdk/anthropic';
import * as os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface TerminalAgentToolOptions {
    statusCallback: AgentStatusCallback;
    abortController: AbortController;
}

@Injectable()
export class TerminalAgentTool extends BaseTool {
    private platform: string;
    private readonly COMMAND_TIMEOUT_MS = 30000; // 30 seconds for complex operations

    constructor(options: TerminalAgentToolOptions) {
        super({
            statusCallback: options.statusCallback,
            abortController: options.abortController,
        });
        this.platform = os.platform();
        this.emitStatus(`Terminal Agent initialized`, StatusEnum.RUNNING);
    }

    /**
     * Execute a bash command using simple exec
     */
    private async executeBashCommand(command: string): Promise<string> {
        this.emitStatus(`Executing: ${command}`, StatusEnum.RUNNING);
        try {
            const { stdout, stderr } = await execAsync(command, {
                cwd: '/config',
                timeout: this.COMMAND_TIMEOUT_MS,
                env: {
                    ...process.env,
                    TERM: 'xterm-256color'
                }
            });

            // Combine stdout and stderr, then mask sensitive information
            let output = '';
            if (stdout.trim()) {
                output += `STDOUT:\n${stdout.trim()}`;
            }
            if (stderr.trim()) {
                if (output) output += '\n\n';
                output += `STDERR:\n${stderr.trim()}`;
            }

            const maskedOutput = this.maskSensitiveOutput(output);
            return maskedOutput || 'Command executed successfully with no output.';

        } catch (error: any) {
            const maskedError = this.maskSensitiveOutput(error.message);
            return maskedError;
        }
    }

    /**
     * Mask sensitive information in terminal output
     */
    private maskSensitiveOutput(output: string): string {
        // Mask any API keys or sensitive environment variables
        let maskedOutput = output;
        
        // Mask anything that looks like an API key pattern
        maskedOutput = maskedOutput.replace(/([A-Za-z0-9_]*API_KEY[A-Za-z0-9_]*\s*=\s*)([^\s\n]+)/gi, '$1***MASKED***');
        
        // Mask common API key formats
        maskedOutput = maskedOutput.replace(/sk-[a-zA-Z0-9-]{20,}/g, 'sk-***MASKED***');
        maskedOutput = maskedOutput.replace(/gsk_[a-zA-Z0-9]{20,}/g, 'gsk_***MASKED***');
        maskedOutput = maskedOutput.replace(/AIzaSy[a-zA-Z0-9_-]{33}/g, 'AIzaSy***MASKED***');
        maskedOutput = maskedOutput.replace(/hf_[a-zA-Z0-9]{20,}/g, 'hf_***MASKED***');
        
        // Mask any token-like strings that might be keys
        maskedOutput = maskedOutput.replace(/\b[a-zA-Z0-9]{32,}\b/g, (match) => {
            // Only mask if it looks like a key (long alphanumeric string)
            if (match.length > 20 && /^[a-zA-Z0-9_-]+$/.test(match)) {
                return '***MASKED***';
            }
            return match;
        });
        
        return maskedOutput;
    }


    /**
     * Get the system prompt for the terminal agent
     */
    private getSystemPrompt(): string {
        return `You are an elite AI system operator with access to a terminal. Each command executes independently in the /config directory.

AVAILABLE CLI PROGRAMS: Standard unix utilities: file operations (ls, cat, head, tail, find, grep, sed, awk, cut, sort, uniq, mkdir, mv, cp, rm, chmod, chown, tar, gzip), system tools (ps, kill, top, df, du, mount, ssh, scp, systemctl, service), development tools (git, npm, node, python3, make, cmake, gcc, g++, perl), web tools (curl, nginx, chromium), media tools (ffmpeg, convert, mogrify, identify, montage), window management (wmctrl, xdg-open, xrandr, xset, xprop, xwininfo), text editors (mousepad), file managers (thunar), terminals (xterm, uxterm, lxterm), utilities and shells.
xdotool for scroll and type

CRITICAL SECURITY RESTRICTIONS:
   Operations limited to /config directory only
   Never access .env files or environment variables
   All file paths must be within /config

PARALLEL EXECUTION RULES:
   CLI tools: Use (cmd1 & cmd2 & wait) when you need to wait for completion
   GUI apps: Launch with & but NO wait (ex: mousepad, thunar etc)
   Default to parallel: Group independent commands with '&'
   Only wait when subsequent commands depend on earlier ones completing AND all commands are CLI tools

WAITING BEHAVIOR:
   WAIT for CLI commands: file operations, system queries, text processing
   DO NOT WAIT for GUI applications: mousepad, thunar, xterm, uxterm, lxterm, chromium
   WAIT for dependent operations: When subsequent commands need previous commands' output

OPERATIONAL PHILOSOPHY
1.  Be surgical with context:
       Use head, tail, grep for previews
       Use wc -l to check file sizes
       Read full files when needed (cat for complete analysis)
2.  Precision manipulation:
       Use sed, awk, cut for file editing
       Chain commands with pipes
3.  Parallelism:
       CLI tools: Use & and wait when synchronization needed
       GUI apps: Use & without wait
       Example: (grep -r "TODO" /config/src & grep -r "FIXME" /config/src & wait) & mousepad /config/file.txt &
4.  Error handling:
       Stop after three consecutive errors and report to user

Platform Info:
   When using xdg-open
   Working Directory: /config
   Command Execution: Each command runs independently
   Parallel Execution: CLI operations can run concurrently with wait when needed; GUI apps launch independently`;
    }


    /**
     * Execute natural language instruction by calling the AI model.
     */
    private async executeInstruction(instruction: string, maxSteps: number): Promise<string> {
        this.emitStatus(`Processing request: "${instruction}"`, StatusEnum.RUNNING);

        try {
            const { text, toolCalls, toolResults } = await generateText({
                model: anthropic('claude-sonnet-4-20250514'),
                system: this.getSystemPrompt(),
                maxSteps,
                tools: {
                    bashExecutor: tool({
                        description:
                            'Executes bash commands. Each command runs independently in /config directory.',
                        parameters: z.object({
                            command: z.string().describe('The bash command to execute.'),
                        }),
                        execute: async ({ command }) => this.executeBashCommand(command),
                    }),
                },
                toolChoice: 'auto',
                abortSignal: this.abortController.signal,
                messages: [{ role: 'user', content: instruction }],
            });

            // If the model used tools, provide a summary of what it did.
            if (toolCalls.length > 0) {
                const summary = toolResults.map(result => `Executed: \`${result.args.command}\`\nResult:\n${result.result}`).join('\n---\n');
                this.emitStatus(`Terminal Agent completed ${toolCalls.length} commands`, StatusEnum.RUNNING);
                return `Action completed. Final summary:\n${text}\n\nExecution Log:\n${summary}`;
            }

            this.emitStatus(text, StatusEnum.RUNNING);
            return text;
        } catch (error) {
            console.error('Error in executeInstruction:', error);
            return `Error processing instruction: ${error.message}`;
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
                    `A high-level command. "Search for 'latest AI research' on the internet", type: "Meaning of life"`
                ),
                maxSteps: z.number().describe('The maximum number of steps it would take a user with terminal access.').min(2).max(10),
            }),
            execute: async ({ instruction, maxSteps }) => this.executeInstruction(instruction, maxSteps),
        });
    }
}