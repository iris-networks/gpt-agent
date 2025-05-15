import { tool } from 'ai';
import { z } from 'zod';
import { exec } from 'child_process';
import * as os from 'os';
/**
 * Tool that opens a file using the system's default application
 * Uses different commands based on the platform (macOS, Windows, Linux)
 */
export const openFileTool = tool({
  description: 'Opens a file using the system\'s default application based on the platform.',
  parameters: z.object({
    filePath: z.string().describe('Absolute path to the file to be opened')
  }),
  execute: async ({ filePath }) => {
    const platform = os.platform();
    let command: string;

    // Select the appropriate command based on platform
    switch (platform) {
      case 'darwin': // macOS
        command = `open "${filePath}"`;
        break;
      case 'win32': // Windows
        command = `start "" "${filePath}"`;
        break;
      case 'linux': // Linux
        command = `xdg-open "${filePath}"`;
        break;
      default:
        return `Unsupported platform: ${platform}`;
    }

    return new Promise<string>((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error opening file: ${error.message}`);
          reject(`Failed to open file: ${error.message}`);
          return;
        }

        if (stderr) {
          console.warn(`Warning: ${stderr}`);
        }

        resolve(`File opened successfully: ${filePath}`);
      });
    });
  }
});