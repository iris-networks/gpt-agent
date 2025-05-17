import { tool } from 'ai';
import { z } from 'zod';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { homedir } from 'os';

const execPromise = promisify(exec);

/**
 * Execute a command with a timeout
 * @param command Command to execute
 * @param timeoutMs Timeout in milliseconds
 * @returns Promise that resolves with stdout or rejects with error
 */
function execWithTimeout(command: string, timeoutMs: number = 300000): Promise<{stdout: string, stderr: string}> {
  return new Promise((resolve, reject) => {
    // Split the command into parts
    const parts = command.split(' ');
    const cmd = parts[0];
    const args = parts.slice(1).filter(arg => arg.trim().length > 0);

    // Spawn the process
    const process = spawn(cmd, args, { shell: true });

    let stdout = '';
    let stderr = '';

    // Collect output
    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // Handle process completion
    process.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Process exited with code ${code}: ${stderr}`));
      }
    });

    // Handle process errors
    process.on('error', (err) => {
      reject(err);
    });

    // Set timeout
    const timeout = setTimeout(() => {
      process.kill();
      reject(new Error(`Command execution timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    // Clear timeout on completion
    process.on('close', () => {
      clearTimeout(timeout);
    });
  });
}

/**
 * Code Tool - Generate code using Claude Code
 * 
 * This tool provides an interface to generate code using Claude Code
 * It can generate code based on a prompt and save it to a file in the .iris/code directory
 */
export const codeTool = tool({
  description: 'Generate code using Claude Code',
  parameters: z.object({
    prompt: z.string()
      .describe('The prompt for Claude Code to generate code. Be specific about programming language, requirements, and constraints.'),

    projectName: z.string()
      .describe('A unique name for the project/code snippet.')
  }),
  execute: async ({ prompt, projectName }) => {
    console.log(`Generating code for project "${projectName}" with prompt: "${prompt.substring(0, 50)}..."`);

    try {
      // Create .iris/code directory structure if it doesn't exist
      const codeBaseDir = path.join(homedir(), '.iris', 'code');
      await fs.mkdir(codeBaseDir, { recursive: true });

      // Create project directory
      const projectDir = path.join(codeBaseDir, projectName);
      await fs.mkdir(projectDir, { recursive: true });

      // Create a temporary file for the prompt
      const tmpDir = path.join(homedir(), '.iris', 'tmp');
      await fs.mkdir(tmpDir, { recursive: true });
      const promptFile = path.join(tmpDir, `prompt-${Date.now()}.txt`);
      await fs.writeFile(promptFile, prompt);

      // Execute Claude Code with the prompt
      console.log(`Starting code generation for project ${projectName}`);
      const { stdout, stderr } = await execPromise(
        `claude-code -p "${promptFile}" --output-dir "${projectDir}"`
      );
      
      // Clean up temporary file
      await fs.unlink(promptFile).catch(err => console.error('Error removing temp file:', err));
      
      // If there was an error
      if (stderr) {
        console.error('Claude Code error:', stderr);
        return {
          success: false,
          error: stderr,
          projectPath: null
        };
      }

      // Check if files were created
      try {
        // List the generated files in the project directory
        const files = await fs.readdir(projectDir);

        if (files.length === 0) {
          return {
            success: false,
            error: 'No files were generated',
            projectPath: projectDir
          };
        }

        // Read the first file as a sample
        const sampleFile = files[0];
        const sampleFilePath = path.join(projectDir, sampleFile);
        const sampleCode = await fs.readFile(sampleFilePath, 'utf-8');

        return {
          success: true,
          message: `Code successfully generated in ${projectDir}`,
          projectPath: projectDir,
          files: files,
          sampleFile: sampleFile,
          sampleCode: sampleCode.substring(0, 200) + (sampleCode.length > 200 ? '...' : '')
        };
      } catch (err) {
        return {
          success: false,
          error: `Failed to read generated files: ${err.message}`,
          projectPath: projectDir
        };
      }
    } catch (error) {
      console.error('Code generation failed:', error);
      return {
        success: false,
        error: `Code generation failed: ${error.message}`,
        projectPath: null
      };
    }
  }
});