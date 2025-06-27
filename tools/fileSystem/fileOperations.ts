import { tool } from 'ai';
import { z } from 'zod';
import * as fs from 'fs/promises';
import { validatePath, safeExecute, FileSystemResponse } from './utils';

/**
 * Read a file from the restricted directory
 */
export const readFile = tool({
  description: 'Read the contents of a file within the base directory',
  parameters: z.object({
    path: z.string().describe('Absolute path to the file ')
  }),
  execute: async ({ path: filePath }): Promise<FileSystemResponse<string>> => {
    return safeExecute(async () => {
      const validPath = validatePath(filePath);
      const content = await fs.readFile(validPath, 'utf-8');
      return content;
    }, 'Failed to read file');
  }
});

/**
 * Write content to a file in the restricted directory
 */
export const writeFile = tool({
  description: 'Write content to a file within the base directory, overwriting if it exists',
  parameters: z.object({
    path: z.string().describe('Absolute path to the file '),
    content: z.string().describe('Content to write to the file')
  }),
  execute: async ({ path: filePath, content }): Promise<FileSystemResponse> => {
    return safeExecute(async () => {
      const validPath = validatePath(filePath);
      await fs.writeFile(validPath, content, 'utf-8');
      return `File written successfully at ${filePath}`;
    }, 'Failed to write file');
  }
});

/**
 * Append content to a file in the restricted directory
 */
export const appendToFile = tool({
  description: 'Append content to an existing file within the base directory',
  parameters: z.object({
    path: z.string().describe('Absolute path to the file '),
    content: z.string().describe('Content to append to the file')
  }),
  execute: async ({ path: filePath, content }): Promise<FileSystemResponse> => {
    return safeExecute(async () => {
      const validPath = validatePath(filePath);
      await fs.appendFile(validPath, content, 'utf-8');
      return `Content appended successfully to ${filePath}`;
    }, 'Failed to append to file');
  }
});

/**
 * Delete a file from the restricted directory
 */
export const deleteFile = tool({
  description: 'Delete a file within the base directory',
  parameters: z.object({
    path: z.string().describe('Absolute path to the file ')
  }),
  execute: async ({ path: filePath }): Promise<FileSystemResponse> => {
    return safeExecute(async () => {
      const validPath = validatePath(filePath);
      await fs.unlink(validPath);
      return `File deleted successfully at ${filePath}`;
    }, 'Failed to delete file');
  }
});

/**
 * Move/rename a file within the restricted directory
 */
export const moveFile = tool({
  description: 'Move or rename a file within the base directory',
  parameters: z.object({
    source: z.string().describe('Source path '),
    destination: z.string().describe('Destination path ')
  }),
  execute: async ({ source, destination }): Promise<FileSystemResponse> => {
    return safeExecute(async () => {
      const validSourcePath = validatePath(source);
      const validDestPath = validatePath(destination);
      await fs.rename(validSourcePath, validDestPath);
      return `File moved successfully from ${source} to ${destination}`;
    }, 'Failed to move file');
  }
});

/**
 * Copy a file within the restricted directory
 */
export const copyFile = tool({
  description: 'Copy a file within the base directory',
  parameters: z.object({
    source: z.string().describe('Source path '),
    destination: z.string().describe('Destination path ')
  }),
  execute: async ({ source, destination }): Promise<FileSystemResponse> => {
    return safeExecute(async () => {
      const validSourcePath = validatePath(source);
      const validDestPath = validatePath(destination);
      await fs.copyFile(validSourcePath, validDestPath);
      return `File copied successfully from ${source} to ${destination}`;
    }, 'Failed to copy file');
  }
});