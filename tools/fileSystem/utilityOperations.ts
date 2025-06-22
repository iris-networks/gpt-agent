import { tool } from 'ai';
import { z } from 'zod';
import * as fs from 'fs/promises';
import * as os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import { validatePath, safeExecute, FileSystemResponse } from './utils';

const execAsync = promisify(exec);

/**
 * Get file or directory metadata
 */
export const getStats = tool({
  description: 'Get file or directory metadata within the designated base directory',
  parameters: z.object({
    path: z.string().describe('Absolute path to the file or directory relative to the base directory')
  }),
  execute: async ({ path: itemPath }): Promise<FileSystemResponse> => {
    return safeExecute(async () => {
      const validPath = validatePath(itemPath);
      const stats = await fs.stat(validPath);
      
      return {
        size: stats.size,
        isDirectory: stats.isDirectory(),
        isFile: stats.isFile(),
        isSymbolicLink: stats.isSymbolicLink(),
        created: stats.birthtime,
        modified: stats.mtime,
        accessed: stats.atime
      };
    }, 'Failed to get stats');
  }
});

/**
 * Check if a file or directory exists
 */
export const exists = tool({
  description: 'Check if a file or directory exists within the designated base directory',
  parameters: z.object({
    path: z.string().describe('Absolute path to the file or directory relative to the base directory')
  }),
  execute: async ({ path: itemPath }): Promise<FileSystemResponse<boolean>> => {
    // We need special handling here as checking existence shouldn't throw if the file doesn't exist
    try {
      const validPath = validatePath(itemPath);
      
      try {
        await fs.access(validPath);
        return { success: true, data: true };
      } catch {
        return { success: true, data: false };
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to check existence'
      };
    }
  }
});

/**
 * Open a file or directory with the system's default application
 */
export const openFile = tool({
  description: 'Open a file or directory with the system\'s default application. Uses "open" on macOS and "xdg-open" on Linux.',
  parameters: z.object({
    path: z.string().describe('Absolute path to the file or directory to open, relative to the base directory')
  }),
  execute: async ({ path: itemPath }): Promise<FileSystemResponse> => {
    return safeExecute(async () => {
      const validPath = validatePath(itemPath);
      
      // Check if the file exists before attempting to open it
      try {
        await fs.access(validPath);
      } catch (error) {
        throw new Error(`File or directory does not exist: ${itemPath}`);
      }
      
      // Determine the platform and use the appropriate open command
      const platform = os.platform();
      let command;
      
      if (platform === 'darwin') {
        // macOS uses the 'open' command
        command = `open "${validPath}"`;
      } else if (platform === 'linux') {
        // Linux uses 'xdg-open'
        command = `xdg-open "${validPath}"`;
      } else if (platform === 'win32') {
        // Windows uses 'start'
        command = `start "" "${validPath}"`;
      } else {
        throw new Error(`Unsupported platform: ${platform}`);
      }
      
      // Execute the command
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr && stderr.trim() !== '') {
        throw new Error(`Error opening file: ${stderr}`);
      }
      
      return {
        message: `Successfully opened ${itemPath}`,
        platform,
        command
      };
    }, 'Failed to open file or directory');
  }
});