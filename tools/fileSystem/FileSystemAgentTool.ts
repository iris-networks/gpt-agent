import { tool, generateText, ToolSet } from 'ai';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { BaseTool } from '../../src/tools/base/BaseTool';
import { AgentStatusCallback } from '../../src/agent_v2/types';
import { StatusEnum } from '@app/packages/ui-tars/shared/src/types';
import { anthropic } from '@ai-sdk/anthropic';
import { isRunningInDocker, safeExecute } from './utils';
import * as os from 'os';
import { promisify } from 'util';
import { exec } from 'child_process';


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
   * Get system prompt for the file system agent
   */
  private getSystemPrompt(): string {
    return `You are a File System Agent that can perform file(s) and folder(s) operations using Perl commands.

Available tool:
- perlExecutor: Execute Perl commands for file operations as user abc

Desktop Directory:
- Desktop path is: ${DESKTOP_PATH}
- Use this path when creating new files/folders

Guidelines:
- ALWAYS find absolute paths for files using case-insensitive search before operations
- When creating new files/folders, use ${DESKTOP_PATH} as the default location
- Club multiple operations into single Perl commands when possible
- When reading files, only read as much as necessary (use read() with byte limit for large files)
- Use appropriate Perl modules (File::Find, File::Path, File::Copy, Cwd) for robust operations

Optimization:
- Combine multiple file operations in one Perl command when possible
- Use efficient reading methods - don't read entire large files if you only need part
- Use File::Find for searching instead of manual directory traversal`;
  }

  /**
   * Execute natural language instruction for file system operations
   */
  private async executeInstruction(instruction: string): Promise<string> {
    this.emitStatus(`Processing file system request`, StatusEnum.RUNNING);

    try {
      const systemPrompt = this.getSystemPrompt();

      const { text, steps } = await generateText({
        model: anthropic("claude-sonnet-4-20250514"),
        system: systemPrompt,
        maxSteps: 10,
        tools: {
          perlExecutor: tool({
            description: 'Takes perl commands, executes them and returns an output',
            parameters: z.object({
              command: z.string().describe('Perl command(s) to execute')
            }),
            execute: async ({ command }) => {
              return safeExecute(async () => {
                const fullCommand = `sudo -u abc ${command}`;

                try {
                  const { stdout, stderr } = await execAsync(fullCommand);

                  if (stderr && stderr.trim()) {
                    return `Command executed with warnings:\nSTDOUT: ${stdout}\nSTDERR: ${stderr}`;
                  }

                  return stdout || 'Command executed successfully (no output)';
                } catch (error: any) {
                  throw new Error(`Perl command failed: ${error.message}`);
                }
              }, 'Failed to execute Perl command');
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
      description: `Intelligent file system agent that performs read, write, list, create, delete, copy, move, search, and existence check operations on files and directories using natural language commands. Executes multiple operations in parallel for optimal performance - example: "Read config.json and data.xml, then write the processed results to output.json and backup.json"`,

      parameters: z.object({
        instruction: z.string()
          .describe(`Natural language instruction for file system operations`)
      }),

      execute: async ({ instruction }) => {
        this.emitStatus(`File System: ${instruction}`, StatusEnum.RUNNING);
        return this.executeInstruction(instruction);
      }
    });
  }
}