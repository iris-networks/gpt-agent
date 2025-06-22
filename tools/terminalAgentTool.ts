import { tool, generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

let isInitialized = false;

/**
 * Execute a command in the terminal and return the result
 * @param command The command to execute
 * @returns Object containing success status, output and error
 */
async function executeInTerminal(command: string): Promise<{
  success: boolean;
  output: string;
  error?: string;
}> {
  try {
    const { stdout, stderr } = await execAsync(command);
    return {
      success: true,
      output: stdout.trim(),
      error: stderr.trim() || undefined
    };
  } catch (error) {
    return {
      success: false,
      output: '',
      error: error.message || 'Unknown error'
    };
  }
}

/**
 * Initialize the terminal environment for the user
 */
function initializeTerminalAsAbcUser(): void {
  // Setup any necessary environment variables or configurations here
  // This function can be expanded based on specific initialization requirements
  console.log('Terminal environment initialized');
}

export const terminalAgentTool = tool({
  description: 'Execute complex terminal operations by creating and running a bash script',
  parameters: z.object({
    task: z.string().describe("What is the task that this agent needs to perform using the terminal in natural language.")
  }),
  execute: async ({ task }) => {
    if (!isInitialized) {
      initializeTerminalAsAbcUser();
      isInitialized = true;
    }

    // First, change to home directory
    await executeInTerminal('cd $HOME');

    // Then collect system information to help the agent understand context
    const currentUser = await executeInTerminal('whoami');
    const currentDir = await executeInTerminal('pwd');

    // Check if tree command exists, if not use ls as fallback
    const checkTree = await executeInTerminal('command -v tree || echo "not_found"');
    let folderStructure;

    if (checkTree.output.trim() !== "not_found") {
      // Use tree with depth of 3 and exclude hidden files
      folderStructure = await executeInTerminal('tree -L 3 -I ".*" .');
    } else {
      // Fallback to ls if tree is not available
      folderStructure = await executeInTerminal('ls -la --ignore=".*"');
    }

    const contextInfo = `
Current user: ${currentUser.output}
Current directory: ${currentDir.output}
Folder structure (depth: 3, excluding hidden files):
${folderStructure.output}
`;

    // Generate a bash script based on the task and context
    const { object } = await generateObject({
      model: anthropic('claude-3-5-haiku-latest'),
      schema: z.object({
        script: z.string().describe('Complete bash script with proper shebang, error handling, and execution steps')
      }),
      system: `You are a terminal expert who writes bash scripts. You've been given a task and system context information.
Based on this, you will create a complete bash script that:
1. Starts with the proper shebang (#!/bin/bash)
2. Includes proper error handling (set -e, error checks)
3. Performs all required operations to complete the task
4. Is well-commented but concise
5. Uses absolute paths when necessary for reliability
6. Returns meaningful output to the user
7. Is completely self-contained (doesn't need interactive input)

Return ONLY the complete bash script as a string in the 'script' field, nothing else.`,
      prompt: `Task: ${task}

System context information:
${contextInfo}

Create a bash script that accomplishes this task.`
    });

    // Create a temporary script file with timestamp to avoid collisions
    const timestamp = Date.now();
    const scriptPath = `/tmp/zenobia_script_${timestamp}.sh`;

    try {
      // Write the script to the temporary file
      const writeResult = await executeInTerminal(`cat > ${scriptPath} << 'ZENOBIASCRIPT'
#!/bin/bash
${object.script}
ZENOBIASCRIPT`);

      if (!writeResult.success) {
        return {
          success: false,
          summary: `Failed to create script file: ${writeResult.error || 'Unknown error'}`,
          contextInfo,
          script: object.script
        };
      }

      // Make the script executable
      const chmodResult = await executeInTerminal(`chmod +x ${scriptPath}`);

      if (!chmodResult.success) {
        return {
          success: false,
          summary: `Failed to make script executable: ${chmodResult.error || 'Unknown error'}`,
          contextInfo,
          script: object.script
        };
      }

      // Execute the script
      const executionResult = await executeInTerminal(`${scriptPath}`);

      // Clean up the script file
      await executeInTerminal(`rm ${scriptPath}`);

      return {
        success: executionResult.success,
        summary: executionResult.success
          ? `Task completed successfully. Output: ${executionResult.output}`
          : `Task execution failed: ${executionResult.error || 'Unknown error'}`,
        contextInfo,
        script: object.script,
        output: executionResult.output,
        error: executionResult.error
      };
    } catch (error) {
      // Try to clean up the script file even if execution failed
      await executeInTerminal(`rm -f ${scriptPath}`);

      return {
        success: false,
        summary: `Error during script execution: ${error.message}`,
        contextInfo,
        script: object.script,
        error: error.message
      };
    }
  }
});