import { tool } from 'ai';
import { z } from 'zod';
import * as fs from 'fs/promises';
import { validatePath, safeExecute, FileSystemResponse } from './utils';

/**
 * List contents of a directory in the restricted path
 */
export const listDirectory = tool({
  description: 'List contents of a directory within the base directory',
  parameters: z.object({
    path: z.string().describe('Absolute path to the directory relative to the base directory')
  }),
  execute: async ({ path: dirPath }): Promise<FileSystemResponse> => {
    return safeExecute(async () => {
      const validPath = validatePath(dirPath);
      const entries = await fs.readdir(validPath, { withFileTypes: true });

      // Filter out hidden files and directories (those starting with .)
      const filteredEntries = entries.filter(entry => !entry.name.startsWith('.'));

      return filteredEntries.map(entry => ({
        name: entry.name,
        isDirectory: entry.isDirectory(),
        isFile: entry.isFile(),
        isSymlink: entry.isSymbolicLink()
      }));
    }, 'Failed to list directory');
  }
});

/**
 * Create a directory in the restricted path
 */
export const createDirectory = tool({
  description: 'Create a directory within the base directory',
  parameters: z.object({
    path: z.string().describe('Absolute path to the directory relative to the base directory'),
    recursive: z.boolean().optional().describe('Create parent directories if they do not exist')
  }),
  execute: async ({ path: dirPath, recursive = false }): Promise<FileSystemResponse> => {
    return safeExecute(async () => {
      const validPath = validatePath(dirPath);
      await fs.mkdir(validPath, { recursive });
      return `Directory created successfully at ${dirPath}`;
    }, 'Failed to create directory');
  }
});

/**
 * Delete an empty directory in the restricted path
 */
export const deleteDirectory = tool({
  description: 'Delete an empty directory within the base directory',
  parameters: z.object({
    path: z.string().describe('Absolute path to the directory relative to the base directory')
  }),
  execute: async ({ path: dirPath }): Promise<FileSystemResponse> => {
    return safeExecute(async () => {
      const validPath = validatePath(dirPath);
      
      // Check if directory is empty first
      const entries = await fs.readdir(validPath);
      if (entries.length > 0) {
        throw new Error('Directory is not empty');
      }
      
      await fs.rmdir(validPath);
      return `Directory deleted successfully at ${dirPath}`;
    }, 'Failed to delete directory');
  }
});