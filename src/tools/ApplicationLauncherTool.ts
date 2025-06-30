import { tool, generateText, ToolSet } from 'ai';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { BaseTool } from './base/BaseTool';
import { exec } from 'child_process';
import { promisify } from 'util';
import { AgentStatusCallback } from '../agent_v2/types';
import { StatusEnum } from '@app/packages/ui-tars/shared/src/types';
import { anthropic } from '@ai-sdk/anthropic';
import * as os from 'os';
import { isRunningInDocker, BASE_PATH } from '../../tools/fileSystem/utils';

const execAsync = promisify(exec);

interface ApplicationLauncherToolOptions {
  statusCallback: AgentStatusCallback;  // MANDATORY
  abortController: AbortController;     // MANDATORY
}

@Injectable()
export class ApplicationLauncherTool extends BaseTool {
  private platform: string;

  constructor(options: ApplicationLauncherToolOptions) {
    super({
      statusCallback: options.statusCallback,
      abortController: options.abortController
    });

    this.platform = os.platform();
    const userInfo = this.platform === 'linux' ? ` (will run as user abc with DISPLAY=${process.env.DISPLAY})` : '';
    console.log(userInfo)
  }

  /**
   * Validate and sanitize the command
   */
  private validateCommand(command: string): { isValid: boolean; sanitized: string } {
    const sanitized = command.trim();
    
    // Basic safety check - block dangerous characters
    if (sanitized.length > 0 && !sanitized.includes(';') && !sanitized.includes('&&') && !sanitized.includes('||')) {
      return { isValid: true, sanitized };
    }
    
    return { isValid: false, sanitized };
  }

  /**
   * Get the appropriate search path and command prefix
   */
  private getSearchConfig(): { searchPath: string; commandPrefix: string } {
    if (isRunningInDocker()) {
      return {
        searchPath: BASE_PATH, // Uses /config in container
        commandPrefix: this.platform === 'linux' ? `sudo -u abc DISPLAY=${process.env.DISPLAY}` : ''
      };
    } else {
      return {
        searchPath: BASE_PATH, // Uses ~/.iris in local environment
        commandPrefix: ''
      };
    }
  }

  /**
   * Build command for execution with user switching on Linux
   */
  private buildCommand(command: string): string {
    const { commandPrefix } = this.getSearchConfig();
    
    if (commandPrefix) {
      return `${commandPrefix} ${command}`;
    }
    
    return command;
  }

  /**
   * Create file search and application launch tools
   */
  private createAgentTools(): ToolSet {
    return {
      findFile: tool({
        description: 'Find files by name or pattern in the user directory',
        parameters: z.object({
          filename: z.string().describe('Name or pattern of the file to find (e.g., "document.pdf", "*.txt")')
        }),
        execute: async ({ filename }) => {
          const { searchPath, commandPrefix } = this.getSearchConfig();
          this.emitStatus(`Searching for file: ${filename} in ${searchPath}`, StatusEnum.RUNNING);
          
          try {
            // Build find command with proper user context if in container
            const findCommand = `find "${searchPath}" -name "${filename}" -type f 2>/dev/null | head -10`;
            const fullCommand = commandPrefix ? `${commandPrefix} ${findCommand}` : findCommand;
            
            const { stdout } = await execAsync(fullCommand);
            const files = stdout.trim().split('\n').filter(f => f.length > 0);
            
            if (files.length === 0) {
              this.emitStatus(`No files found matching: ${filename}`, StatusEnum.RUNNING);
              return `No files found matching "${filename}" in ${searchPath}`;
            }
            
            this.emitStatus(`Found ${files.length} files matching: ${filename}`, StatusEnum.RUNNING);
            return `Found files:\n${files.join('\n')}`;
          } catch (error) {
            this.emitStatus(`File search failed: ${error.message}`, StatusEnum.ERROR, { error });
            return `Error searching for files: ${error.message}`;
          }
        }
      }),

      executeCommand: tool({
        description: 'Execute a system command (applications, URLs, etc.)',
        parameters: z.object({
          command: z.string().describe('Command to execute'),
          waitForExit: z.boolean().optional().default(false).describe('Wait for completion')
        }),
        execute: async ({ command, waitForExit = false }) => {
          return this.executeCommand(command, waitForExit);
        }
      })
    };
  }

  /**
   * Execute command with status updates
   */
  private async executeCommand(command: string, waitForExit?: boolean): Promise<string> {
    this.emitStatus(`Working on launching the application`, StatusEnum.RUNNING);

    // Validate the command
    const validation = this.validateCommand(command);
    if (!validation.isValid) {
      this.emitStatus(`Invalid command provided`, StatusEnum.ERROR);
      return `Error: Invalid command provided. Command may contain dangerous characters.`;
    }

    try {
      const fullCommand = this.buildCommand(validation.sanitized);
      this.emitStatus(`Launching application`, StatusEnum.RUNNING);

      if (waitForExit) {
        // Wait for the process to complete
        const { stdout, stderr } = await execAsync(fullCommand);
        
        if (stderr) {
          this.emitStatus(`Command executed with warnings`, StatusEnum.RUNNING);
          return `Command executed with warnings: ${stderr}. Output: ${stdout || 'No output'}`;
        } else {
          this.emitStatus(`Command executed successfully`, StatusEnum.RUNNING);
          return `Command executed successfully. Output: ${stdout || 'No output'}`;
        }
      } else {
        // Launch and don't wait (for GUI applications)
        exec(fullCommand, (error) => {
          if (error) {
            this.emitStatus(`Command execution failed: ${error.message}`, StatusEnum.ERROR, { error });
          } else {
            console.log(`Command executed in background`, StatusEnum.RUNNING);
          }
        });

        this.emitStatus(`Application launched successfully in background`, StatusEnum.RUNNING);
        return `Application executed in background successfully.`;
      }
    } catch (error) {
      this.emitStatus(`Failed to execute command: ${error.message}`, StatusEnum.ERROR, { error });
      return `Error executing command: ${error.message}`;
    }
  }


  /**
   * Get platform-specific command info
   */
  private getPlatformCommand(): string {
    switch (this.platform) {
      case 'linux':
        return 'Uses xdg-open for URLs/files';
      case 'darwin':
        return 'Uses open command';
      case 'win32':
        return 'Uses start command';
      default:
        return 'Uses xdg-open for URLs/files';
    }
  }

  /**
   * Get platform-specific examples for parameter description
   */
  private getPlatformExamples(): string {
    switch (this.platform) {
      case 'linux':
        return 'Command to execute (e.g., "chromium", "xdg-open https://duckduckgo.com/?q=search")';
      case 'darwin':
        return 'Command to execute (e.g., "open -a Safari", "open https://duckduckgo.com/?q=search")';
      case 'win32':
        return 'Command to execute (e.g., "start chrome", "start https://duckduckgo.com/?q=search")';
      default:
        return 'Command to execute (e.g., "chromium", "xdg-open https://duckduckgo.com/?q=search")';
    }
  }

  /**
   * Get system prompt for the launcher agent
   */
  private getSystemPrompt(): string {
    return `You are an Application Launcher Agent that can open applications, files, and URLs.

Platform: ${this.platform}
${this.getPlatformCommand()}

Available tools:
- findFile: Search for files when user wants to open a file but doesn't provide full path
- executeCommand: Execute commands to launch applications or open URLs/files

Guidelines:
- When user wants to open a file without providing full path, first use findFile to locate it
- Use appropriate commands for the platform (${this.platform})
- For URLs, always use the platform's open command (${this.getPlatformCommand().toLowerCase()})
- For applications, use direct command names when possible
- Always provide helpful feedback about what was executed

Examples for ${this.platform}:
${this.getPlatformExamples()}`;
  }

  /**
   * Execute natural language instruction
   */
  private async executeInstruction(instruction: string): Promise<string> {
    this.emitStatus(`Working on your request`, StatusEnum.RUNNING);

    try {
      const tools = this.createAgentTools();
      const systemPrompt = this.getSystemPrompt();

      const { text, steps } = await generateText({
        model: anthropic("claude-sonnet-4-20250514"),
        system: systemPrompt,
        maxSteps: 3,
        tools: tools,
        toolChoice: 'auto',
        abortSignal: this.abortController.signal,
        messages: [
          {
            role: 'user',
            content: instruction
          }
        ],
      });

      this.emitStatus(`Instruction completed after ${steps.length} steps`, StatusEnum.RUNNING);
      return text;
    } catch (error) {
      this.emitStatus(`Failed to process instruction: ${error.message}`, StatusEnum.ERROR, { error });
      return `Error processing instruction: ${error.message}`;
    }
  }

  /**
   * Get the AI SDK tool definition
   */
  getToolDefinition() {
    return tool({
      description: `Intelligent application launcher that can open apps, files, and URLs using natural language. Can find files automatically when full path is not provided. ${this.getPlatformCommand()}.`,
      
      parameters: z.object({
        instruction: z.string()
          .describe('Natural language instruction for what to open (e.g., "open chromium", "open my resume.pdf", "search duckduckgo for Gandhi", "open the config folder")')
      }),
      
      execute: async ({ instruction }) => {
        return this.executeInstruction(instruction);
      }
    });
  }
}