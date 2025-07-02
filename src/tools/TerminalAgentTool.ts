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
        
        // Check what user we're currently running as
        const currentUser = process.env.USER || process.env.USERNAME || 'unknown';
        const currentUid = process.getuid ? process.getuid() : 'unknown';
        const currentGid = process.getgid ? process.getgid() : 'unknown';
        
        this.emitStatus(`Terminal Agent initialized`, StatusEnum.RUNNING);
    }

    /**
     * Execute a bash command using simple exec
     */
    private async executeBashCommand(command: string): Promise<string> {
        // Block any commands that try to access /home directory
        if (command.includes('/home')) {
            throw new Error('Security violation: Access to /home directory is strictly prohibited');
        }

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
            throw new Error(`Command failed: ${maskedError}`);
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
        const currentUser = process.env.USER || process.env.USERNAME || 'current user';
        
        return `You are an elite AI system operator with access to a ${this.platform} terminal running as ${currentUser}. Each command executes independently in the /config directory.

Your SOLE tool is 'bashExecutor', which executes bash commands.

**CRITICAL SECURITY RESTRICTIONS:**
- You are STRICTLY LIMITED to operations within the /config directory ONLY
- You MUST NEVER access /home directory - this is absolutely forbidden
- You MUST NEVER access, read, or output .env files or environment variables
- Focus on /config and its subdirectories only
- All file paths should be within /config (e.g., /config/Desktop, /config/Documents, etc.)

**PERFORMANCE OPTIMIZATIONS:**
- **Default file location:** Use /config/Desktop as the default location for creating/placing new files
- **File searching:** Use \`find /config -maxdepth 3 -regex ".*pattern.*"\` for efficient file searches with depth limit
- **File existence checks:** Use \`head -n 5 filename\` or \`ls -la filename\` instead of reading entire files
- **Quick content preview:** Use \`head -n 10\` or \`tail -n 10\` to check file content without loading large files
- **Directory browsing:** Use \`ls -la /config/Desktop\` as starting point for file operations
- **Pattern matching:** Use regex with find for precise file matching: \`find /config -maxdepth 3 -regex ".*\\.txt$"\`
- **Size checking:** Use \`wc -l filename\` to check file size before reading
- **Fast listing:** Use \`ls -1\` for simple file lists, \`ls -la\` for detailed info only when needed

**OPERATIONAL PHILOSOPHY**

1.  **Context is Expensive. Be Surgical.**
    - Use \`head\`, \`tail\`, and \`grep\` instead of dumping large files
    - Count lines with \`wc -l\` before reading large files
    - Example: \`grep -i 'error' /config/logs/application.log | tail -n 20\`

2.  **Precision is Key. Manipulate Directly.**
    - Use \`sed\`, \`awk\`, \`cut\` for file manipulation
    - Chain commands with pipes for efficient processing
    - Example: \`sed -i 's/v1.2/v1.3/g' /config/app/config.yaml\`

3.  **Think Sequentially. Chain Your Actions.**
    - Use \`&&\` to link commands that must succeed in sequence
    - Example: \`cd /config/project && git pull && npm install\`

4.  **Observe, Then Act.**
    - Use \`ls -la\`, \`ps aux\`, \`wmctrl -l\` to gather context before acting
    - Verify before destructive operations

**Platform Info:**
- **OS:** ${this.platform}
- **User:** ${currentUser}
- **Working Directory:** /config
- **Command Execution:** Each command runs independently (no persistent state)

Remember: ALL operations must stay within /config directory. Never access /home directory.`;
    }


    /**
     * Execute natural language instruction by calling the AI model.
     */
    private async executeInstruction(instruction: string): Promise<string> {
        this.emitStatus(`Processing request: "${instruction}"`, StatusEnum.RUNNING);

        try {
            const { text, toolCalls, toolResults } = await generateText({
                model: anthropic('claude-sonnet-4-20250514'),
                system: this.getSystemPrompt(),
                maxSteps: 10,
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

            return text;
        } catch (error) {
            this.emitStatus(`Failed to process instruction: ${error.message}`, StatusEnum.ERROR, { error });
            return `Error processing instruction: ${error.message}`;
        }
    }

    /**
     * Get the AI SDK tool definition for the "wild" agent.
     */
    getToolDefinition() {
        return tool({
            description:
                'A powerful terminal agent that can operate the entire computer using natural language. It can manage files, launch/control apps, manage windows, and interact with the web via command line.',
            parameters: z.object({
                instruction: z.string().describe(
                    `A high-level command. Examples: "Open a terminal, list files, and then open my 'dev' folder in VS Code", "Find the firefox window and search for 'latest AI research'", "take a screenshot of my primary monitor and save it to the desktop as 'capture.png'"`
                ),
            }),
            execute: async ({ instruction }) => this.executeInstruction(instruction),
        });
    }
}