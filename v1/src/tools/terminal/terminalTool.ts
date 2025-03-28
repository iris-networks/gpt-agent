import { z } from 'zod';
import { DynamicTool, StringToolOutput } from 'beeai-framework';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export const TerminalTool = new DynamicTool({
  name: "TerminalTool",
  description: "Executes bash commands in the terminal",
  inputSchema: z.object({
    command: z.string().describe('Bash command to execute'),
    options: z.object({
      cwd: z.string().optional().describe('Current working directory for the command'),
      timeout: z.number().optional().describe('Timeout in milliseconds'),
      maxBuffer: z.number().optional().describe('Max buffer size for stdout/stderr in bytes'),
    }).passthrough().optional().describe('Additional options for command execution')
  }),
  async handler({ command, options }) {
    try {
      // Execute the command with provided options
      const { stdout, stderr } = await execPromise(command, options);
      
      return new StringToolOutput(JSON.stringify({
        success: true,
        stdout,
        stderr: stderr ? stderr : null,
        command
      }, null, 2));
    } catch (error) {
      console.error('Terminal command execution error:', error);
      return new StringToolOutput(JSON.stringify({ 
        success: false, 
        error: true,
        command,
        message: error instanceof Error ? error.message : 'Unknown error',
        stderr: error instanceof Error && 'stderr' in error ? error.stderr : null
      }, null, 2));
    }
  },
});