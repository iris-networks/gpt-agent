import { tool, generateText } from 'ai';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { BaseTool } from '../../src/tools/base/BaseTool';
import { AgentStatusCallback } from '../../src/agent_v2/types';
import { StatusEnum } from '@app/packages/ui-tars/shared/src/types';
// Note: You can swap out the AI model provider as needed.
// import { anthropic } from '@ai-sdk/anthropic';
// import { groq } from '@ai-sdk/groq';
import { google } from '@ai-sdk/google';
import { isRunningInDocker, safeExecute } from './utils';
import * as os from 'os';
import { promisify } from 'util';
import { exec } from 'child_process';
import { anthropic } from '@ai-sdk/anthropic';


const execAsync = promisify(exec);
// Determine Desktop path based on environment
const DESKTOP_PATH = isRunningInDocker() ? '/config/Desktop' : `${os.homedir()}/Desktop`;

interface FileSystemAgentToolOptions {
  statusCallback: AgentStatusCallback;  // MANDATORY
  abortController: AbortController;     // MANDATORY
}

@Injectable()
export class FileSystemAgentTool extends BaseTool {

  constructor(options: FileSystemAgentToolOptions) {
    super({
      statusCallback: options.statusCallback,
      abortController: options.abortController
    });
  }

  /**
   * Get system prompt for the file system agent (using Bash)
   */
  private getSystemPrompt(): string {
    return `You are an expert AI assistant that translates natural language instructions into executable Bash commands for file and folder operations.

Your goal is to accomplish the user's request efficiently and accurately.

SECURITY RESTRICTIONS (CRITICAL):
- You are STRICTLY LIMITED to operations within the /config directory ONLY
- You MUST NEVER access, read, write, or modify files outside of /config
- All paths must be within /config (e.g., /config/Desktop, /config/Documents, etc.)
- REJECT any requests that attempt to access paths outside /config
- Use /config as your working directory root

Key Guidelines:
- You have one tool: 'bashExecutor'. Use it to run Bash commands.
- For complex, multi-step tasks, create a complete Bash script and execute it in a single call to 'bashExecutor'. This is more performant than multiple calls.
- The user's desktop path is '${DESKTOP_PATH}' (must be within /config). Use this as the default working directory and for creating new files/folders unless a different path within /config is specified.
- Optimize for performance. For example, use 'head' or 'tail' to inspect large files instead of reading them entirely with 'cat'.
- Utilize standard Bash utilities like 'ls', 'find', 'mkdir', 'mv', 'cp', 'rm', 'grep', 'awk', etc., to perform operations.
- ALWAYS use absolute paths within /config to avoid ambiguity.
- ALWAYS wrap file and directory paths in double quotes ("") to handle spaces or special characters correctly.
- Chain commands with '&&' to ensure they execute sequentially and stop if one fails.
- To write multiline text, use the 'cat <<'EOF' > "path/to/file.txt"' syntax.
- You MUST correctly escape characters inside your Bash command string so it can be executed directly in the terminal.
`;
  }

  /**
   * Validate that command only operates within /config directory
   */
  private validateConfigPathSecurity(command: string): { isValid: boolean; reason?: string } {
    // Check for potentially dangerous patterns that try to escape /config
    const dangerousPatterns = [
      /\.\.\//, // Parent directory traversal
      /\/\.\.\//,
      /^\//,    // Absolute paths not starting with /config
      /cd\s+(?!\/config)/,  // cd to paths outside /config
      /\/etc/, /\/var/, /\/usr/, /\/home/, /\/root/, /\/tmp/,  // System directories
      /~\//, // Home directory references
      /\$HOME/, // Home environment variable
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(command)) {
        return { 
          isValid: false, 
          reason: `Command contains potentially unsafe path access: ${pattern.source}` 
        };
      }
    }

    // Ensure any absolute paths mentioned start with /config
    const absolutePathMatches = command.match(/\/[\w\/.-]+/g);
    if (absolutePathMatches) {
      for (const path of absolutePathMatches) {
        if (!path.startsWith('/config')) {
          return { 
            isValid: false, 
            reason: `Path ${path} is outside allowed /config directory` 
          };
        }
      }
    }

    return { isValid: true };
  }

  /**
   * Execute natural language instruction for file system operations
   */
  private async executeInstruction(instruction: string): Promise<string> {
    this.emitStatus(`Processing file system request`, StatusEnum.RUNNING);

    try {
      const systemPrompt = this.getSystemPrompt();

      const { text, steps } = await generateText({
        model: anthropic('claude-sonnet-4-20250514'),
        system: systemPrompt,
        maxSteps: 5,
        tools: {
          bashExecutor: tool({
            description: 'Takes a Bash command or a full script, executes it in the shell, and returns the output.',
            parameters: z.object({
              command: z.string().describe('A single line or a multi-line chain of Bash commands ready to execute directly in the shell.')
            }),
            execute: async ({ command }) => {
              return safeExecute(async () => {
                // Security validation - ensure command only operates within /config
                const securityCheck = this.validateConfigPathSecurity(command);
                if (!securityCheck.isValid) {
                  throw new Error(`Security violation: ${securityCheck.reason}. Operations are restricted to /config directory only.`);
                }

                this.emitStatus(`Accessing File System`, StatusEnum.RUNNING);

                const timeoutMs = 10000; // 10 seconds timeout, increased for potentially longer fs ops

                this.emitStatus(`Executing: ${command}`, StatusEnum.RUNNING);
                const execWithTimeout = Promise.race([
                  execAsync(command, { cwd: '/config' }), // Force working directory to /config
                  new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Command timed out')), timeoutMs)
                  )
                ]);

                try {
                  const { stdout, stderr } = await execWithTimeout as { stdout: string; stderr: string };

                  if (stderr && stderr.trim()) {
                    return `Command executed with warnings or errors:\nSTDOUT: ${stdout.trim()}\nSTDERR: ${stderr.trim()}`;
                  }

                  return stdout.trim() || 'Command executed successfully (no output).';
                } catch (error: any) {
                  // Provide a more informative error message, showing the original command for easier debugging.
                  throw new Error(`Bash command failed: ${error.message}\nCOMMAND: ${command}`);
                }
              }, 'Failed to execute Bash command');
            }
          })
        },
        toolChoice: 'auto',
        abortSignal: this.abortController.signal,
        messages: [
          {
            role: 'user',
            content: instruction
          }
        ],
      });


      this.emitStatus(`File system operation completed after ${steps.length} steps`, StatusEnum.RUNNING);
      return text;
    } catch (error) {
      this.emitStatus(`Failed to process file system instruction: ${error.message}`, StatusEnum.ERROR, { error });
      return `Error processing instruction: ${error.message}`;
    }
  }

  /**
   * Get the AI SDK tool definition
   */
  getToolDefinition() {
    return tool({
      description: `Intelligent file system agent that performs read, write, list, create, delete, copy, move, search, and existence check operations on files and directories using natural language commands. Executes multiple operations in parallel for optimal performance - example: "Find all .log files on the Desktop, read the first 10 lines of each, and save the results to a summary.txt file."`,

      parameters: z.object({
        instruction: z.string()
          .describe(`Natural language instruction for file system operations.`)
      }),

      execute: async ({ instruction }) => {
        this.emitStatus(`File System: ${instruction}`, StatusEnum.RUNNING);
        return this.executeInstruction(instruction);
      }
    });
  }
}