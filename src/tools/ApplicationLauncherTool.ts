import { tool, generateText, ToolSet } from 'ai';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { BaseTool } from './base/BaseTool';
import { exec } from 'child_process';
import { promisify } from 'util'; // Re-instating for clean promise conversion
import { AgentStatusCallback } from '../agent_v2/types';
import { StatusEnum } from '@app/packages/ui-tars/shared/src/types';
import { anthropic } from '@ai-sdk/anthropic';
import * as os from 'os';
import { isRunningInDocker, BASE_PATH } from '../../tools/fileSystem/utils';
import { groq } from '@ai-sdk/groq';
import { google } from '@ai-sdk/google';

// The standard, idiomatic way to make `exec` awaitable.
const execAsync = promisify(exec);

interface ApplicationLauncherToolOptions {
  statusCallback: AgentStatusCallback;  // MANDATORY
  abortController: AbortController;     // MANDATORY
}

@Injectable()
export class ApplicationLauncherTool extends BaseTool {
  private platform: string;
  private readonly COMMAND_TIMEOUT_MS = 15000; // 15 seconds timeout for commands

  constructor(options: ApplicationLauncherToolOptions) {
    super({
      statusCallback: options.statusCallback,
      abortController: options.abortController
    });

    this.platform = os.platform();
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
   * Validate that paths and operations are restricted to /config directory
   */
  private validateConfigPathSecurity(command: string): { isValid: boolean; reason?: string } {
    // Check for potentially dangerous patterns that try to escape /config
    const dangerousPatterns = [
      /\.\.\//, // Parent directory traversal
      /\/\.\.\//,
      /cd\s+(?!\/config)/,  // cd to paths outside /config
      /\/etc/, /\/var/, /\/usr/, /\/home/, /\/root/, /\/tmp/, /\/bin/, /\/sbin/,  // System directories
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

    // --- FIX START ---
    // Ensure any absolute paths mentioned start with /config.
    // The regex now uses a negative lookahead `(?!\/)` to ensure we match paths starting with a
    // single `/` (like /home/user) but not protocol-relative URLs starting with `//` (like //example.com).
    const absolutePathRegex = /\/(?!\/)[\w\/.-]+/g;
    const absolutePathMatches = command.match(absolutePathRegex);
    // --- FIX END ---
    
    if (absolutePathMatches) {
      for (const path of absolutePathMatches) {
        // The path check itself remains the same
        if (!path.startsWith('/config')) {
          return { 
            isValid: false, 
            reason: `Security violation: Path ${path} is outside allowed /config directory` 
          };
        }
      }
    }

    return { isValid: true };
  }

  /**
   * Get the appropriate search path. The command prefix for user switching has been removed.
   */
  private getSearchConfig(): { searchPath: string; commandPrefix: string } {
    return {
      searchPath: BASE_PATH, // Uses /config in container or ~/.iris locally
      commandPrefix: ''      // User switching logic ('su abc') has been removed.
    };
  }

  /**
   * Build the final command for execution. The logic for user-switching has been removed.
   */
  private buildCommand(command: string): string {
    const { commandPrefix } = this.getSearchConfig(); // This will always be an empty string now.
    if (commandPrefix) {
      // This logic is now dormant but kept for potential future use with other prefixes.
      // The 'su abc' specific parts have been removed.
      const escapedCommand = command.replace(/"/g, '\\"');
      return `${commandPrefix} "${escapedCommand}"`;
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
          const { searchPath } = this.getSearchConfig();
          this.emitStatus(`Searching for file: ${filename} in ${searchPath}`, StatusEnum.RUNNING);
          
          try {
            const findCommand = `find "${searchPath}" -name "${filename}" -type f 2>/dev/null | head -10`;
            
            // Security validation - ensure command only operates within /config
            const securityCheck = this.validateConfigPathSecurity(findCommand);
            if (!securityCheck.isValid) {
              this.emitStatus(`Security violation: ${securityCheck.reason}`, StatusEnum.ERROR);
              throw new Error(`Security violation: ${securityCheck.reason}. Operations are restricted to /config directory only.`);
            }
            
            const fullCommand = this.buildCommand(findCommand);
            
            // Execute find with a timeout to prevent it from running indefinitely
            const { stdout } = await execAsync(fullCommand, { timeout: this.COMMAND_TIMEOUT_MS });
            const files = stdout.trim().split('\n').filter(f => f.length > 0);
            
            if (files.length === 0) {
              this.emitStatus(`No files found matching: ${filename}`, StatusEnum.RUNNING);
              return `No files found matching "${filename}" in ${searchPath}`;
            }
            
            this.emitStatus(`Found ${files.length} files matching: ${filename}`, StatusEnum.RUNNING);
            return `Found files:\n${files.join('\n')}`;
          } catch (error) {
            // Check if the error is due to a timeout
            const errorMessage = error.killed ? 'Search command timed out' : error.message;
            this.emitStatus(`File search failed: ${errorMessage}`, StatusEnum.ERROR, { error });
            return `Error searching for files: ${errorMessage}`;
          }
        }
      }),

      executeCommand: tool({
        description: 'Execute a system command (applications, URLs, etc.)',
        parameters: z.object({
          command: z.string().describe(`Command to execute (URLs/files will use ${this.getPlatformCommand(true)})`),
          waitForExit: z.boolean().optional().default(false).describe(`Wait for completion. If true, the command will time out after ${this.COMMAND_TIMEOUT_MS / 1000} seconds.`)
        }),
        // This wrapper is necessary to map the tool's single object argument
        // to the multiple arguments of the class method.
        execute: async ({ command, waitForExit }) => await this.executeCommand(command, waitForExit)
      })
    };
  }

  /**
   * Execute command with status updates. It now runs as the current process user.
   */
  private async executeCommand(command: string, waitForExit?: boolean): Promise<string> {
    this.emitStatus(`Working on launching the application`, StatusEnum.RUNNING);
    
    // Security validation - ensure command only operates within /config
    const securityCheck = this.validateConfigPathSecurity(command);
    if (!securityCheck.isValid) {
      this.emitStatus(`Security violation: ${securityCheck.reason}`, StatusEnum.ERROR);
      throw new Error(`Security violation: ${securityCheck.reason}. Operations are restricted to /config directory only.`);
    }
    
    // User switching logic has been removed from buildCommand.
    const fullCommand = this.buildCommand(command);

    try {
      this.emitStatus(`Executing command...`, StatusEnum.RUNNING);

      if (waitForExit) {
        // Wait for the process to complete, with a timeout
        const { stdout, stderr } = await execAsync(fullCommand, { timeout: this.COMMAND_TIMEOUT_MS });
        
        if (stderr) {
          this.emitStatus(`Command executed with warnings`, StatusEnum.RUNNING);
          return `Command executed with warnings: ${stderr}. Output: ${stdout || 'No output'}`;
        }
        
        this.emitStatus(`Command executed successfully`, StatusEnum.RUNNING);
        return `Command executed successfully. Output: ${stdout || 'No output'}`;
      } else {
        // Launch and don't wait (for GUI applications). Add a timeout to the launch itself.
        exec(fullCommand, { timeout: this.COMMAND_TIMEOUT_MS }, (error) => {
          if (error) {
            const errorMessage = error.killed ? 'Background command launch timed out' : error.message;
            this.emitStatus(`Background command execution failed: ${errorMessage}`, StatusEnum.ERROR, { error });
          } else {
            console.log(`Command launched in background: ${fullCommand}`);
          }
        });

        this.emitStatus(`Application launched successfully in background`, StatusEnum.RUNNING);
        return `Application executed in background successfully.`;
      }
    } catch (error) {
      // Check if the error is due to a timeout (applies to the waitForExit=true case)
      const errorMessage = error.killed ? 'Command timed out' : error.message;
      this.emitStatus(`Failed to execute command: ${errorMessage}`, StatusEnum.ERROR, { error });
      return `Error executing command: ${errorMessage}`;
    }
  }

  /**
   * Get platform-specific command info
   */
  private getPlatformCommand(forToolDescription = false): string {
    const commands = {
      linux: 'xdg-open',
      darwin: 'open',
      win32: 'start'
    };
    const command = commands[this.platform] || commands.linux;
    return forToolDescription ? `${command} ...` : `Uses ${command} for URLs/files`;
  }

  /**
   * Get platform-specific examples for parameter description
   */
  private getPlatformExamples(): string {
    switch (this.platform) {
      case 'linux':
        return 'e.g., "chromium", "xdg-open https://duckduckgo.com/?q=search"';
      case 'darwin':
        return 'e.g., "open -a Safari", "open https://duckduckgo.com/?q=search"';
      case 'win32':
        return 'e.g., "start chrome", "start https://duckduckgo.com/?q=search"';
      default:
        return 'e.g., "chromium", "xdg-open https://duckduckgo.com/?q=search"';
    }
  }

  /**
   * Get system prompt for the launcher agent
   */
  private getSystemPrompt(): string {
    const openCommand = this.getPlatformCommand(true).split(' ')[0];
    return `You are an Application Launcher Agent that can open applications, files, and URLs.

Platform: ${this.platform}
${this.getPlatformCommand()}

Available tools:
- findFile: Search for files when the user wants to open a file but doesn't provide the full path.
- executeCommand: Execute commands to launch applications or open URLs/files.

Guidelines:
- If a user wants to open a file without providing a full path, FIRST use findFile to locate it.
- Use appropriate commands for the platform (${this.platform}).
- For URLs, always use the platform's open command (e.g., "${openCommand} https://...").
- For applications, use direct command names when possible.
- Always provide helpful feedback about what was executed.
- Do not use about:blank to open the browser; use a real search engine URL like https://duckduckgo.com.

Examples for ${this.platform}:
${this.getPlatformExamples()}`;
  }

  /**
   * Execute natural language instruction
   */
  private async executeInstruction(instruction: string): Promise<string> {
    this.emitStatus(`Working on your request`, StatusEnum.RUNNING);

    try {
      const { text, steps } = await generateText({
        model: anthropic('claude-sonnet-4-20250514'),
        system: this.getSystemPrompt(),
        maxSteps: 3,
        tools: this.createAgentTools(),
        toolChoice: 'auto',
        abortSignal: this.abortController.signal,
        messages: [{ role: 'user', content: instruction }],
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
      description: `Intelligent application launcher that can open apps, files, and URLs using natural language. It can find files automatically if the full path isn't provided.`,
      parameters: z.object({
        instruction: z.string().describe(`Natural language instruction for what to open (e.g., "open duckduckgo and search for gandhi", "open my resume.pdf", "launch chrome")`)
      }),
      execute: async ({ instruction }) => await this.executeInstruction(instruction)
    });
  }
}