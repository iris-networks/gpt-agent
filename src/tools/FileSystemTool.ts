import { generateText, tool, ToolSet } from 'ai';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { BaseTool } from './base/BaseTool';
import { exec } from 'child_process';
import { promisify } from 'util';
import { anthropic } from '@ai-sdk/anthropic';
import { AgentStatusCallback } from '../agent_v2/types';
import { StatusEnum } from '@app/packages/ui-tars/shared/src/types';

// Import all operation modules
import * as fileOps from '../../tools/fileSystem/fileOperations';
import * as dirOps from '../../tools/fileSystem/directoryOperations';
import * as utilOps from '../../tools/fileSystem/utilityOperations';
import { BASE_PATH, logEnvironmentInfo } from '../../tools/fileSystem/utils';

const execAsync = promisify(exec);

interface FileSystemToolOptions {
  statusCallback: AgentStatusCallback;  // MANDATORY
  abortController: AbortController;     // MANDATORY
}

@Injectable()
export class FileSystemTool extends BaseTool {
  private fsTools: ToolSet;

  constructor(options: FileSystemToolOptions) {
    super({
      statusCallback: options.statusCallback,
      abortController: options.abortController
    });

    // Initialize file system tools
    this.fsTools = this.createFileSystemTools();
    
    // Log environment info on initialization
    logEnvironmentInfo();
  }

  /**
   * Collects all file system tools into a single object
   */
  private createFileSystemTools(): ToolSet {
    return {
      // File Operations
      readFile: fileOps.readFile,
      writeFile: fileOps.writeFile,
      appendToFile: fileOps.appendToFile,
      deleteFile: fileOps.deleteFile,
      moveFile: fileOps.moveFile,
      copyFile: fileOps.copyFile,

      // Directory Operations
      listDirectory: dirOps.listDirectory,
      createDirectory: dirOps.createDirectory,
      deleteDirectory: dirOps.deleteDirectory,

      // Utility Operations
      getStats: utilOps.getStats,
      exists: utilOps.exists,
      openFile: utilOps.openFile,
    };
  }

  /**
   * Get directory tree for BASE_PATH
   */
  private async getConfigTreePrompt(): Promise<string> {
    try {
      this.emitStatus(`Getting directory tree for ${BASE_PATH}`, StatusEnum.RUNNING);
      const { stdout } = await execAsync(`tree -L 3 "${BASE_PATH}"`);
      this.emitStatus("Directory tree retrieved successfully", StatusEnum.RUNNING);
      return `
Here is the directory structure of the ${BASE_PATH} directory for context:
${stdout}`;
    } catch (err) {
      this.emitStatus(`Failed to get directory tree: ${err.message}`, StatusEnum.ERROR, { error: err });
      console.error(`Failed to get tree of ${BASE_PATH} directory:`, err);
      return '';
    }
  }

  /**
   * Execute file system instruction with status updates
   */
  private async executeFileSystemInstruction(instruction: string): Promise<string> {
    this.emitStatus(`Starting file system operation: ${instruction}`, StatusEnum.RUNNING);

    try {
      // Get dynamic tree configuration
      const configTreePrompt = await this.getConfigTreePrompt();
      
      const systemPrompt = `You are a File System Agent that provides safe, sandboxed file system operations.
Follow these rules strictly:
- Use tree command output to understand directory structure
- Respond to user as soon as you have the answer
- Your default location for creating file / folder etc... is the desktop which is located at ${BASE_PATH}/Desktop, absolute files must start with ${BASE_PATH}
${configTreePrompt}`;

      this.emitStatus("Processing file system instruction with AI", StatusEnum.RUNNING);

      // Use generateText to process the instruction and execute file system operations
      const { text, toolResults, steps } = await generateText({
        model: anthropic("claude-sonnet-4-20250514"),
        system: systemPrompt,
        maxSteps: 5,
        tools: this.fsTools,
        toolChoice: 'auto',
        abortSignal: this.abortController.signal,
        messages: [
          {
            role: 'user',
            content: instruction
          }
        ],
      });

      this.emitStatus(`File system operation completed successfully after ${steps.length} steps`, StatusEnum.RUNNING);
      return text;
    } catch (error) {
      this.emitStatus(`File system operation failed: ${error.message}`, StatusEnum.ERROR, { error });
      throw error;
    }
  }

  /**
   * Get the AI SDK tool definition
   */
  getToolDefinition() {
    return tool({
      description: `A secure File System Agent that can perform filesystem operation and returns a summary of the work it completes`,
      parameters: z.object({
        instruction: z.string().describe('Natural language instruction for the file-system operation to perform')
      }),
      execute: async ({ instruction }) => {
        return this.executeFileSystemInstruction(instruction);
      }
    });
  }
}