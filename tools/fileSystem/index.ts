import { generateText, tool, ToolSet } from 'ai';
import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';

// Import all operation modules
import * as fileOps from './fileOperations';
import * as dirOps from './directoryOperations';
import * as utilOps from './utilityOperations';
import { anthropic } from '@ai-sdk/anthropic';
import { logEnvironmentInfo, isRunningInDocker } from './utils';

const execAsync = promisify(exec);

// Export all individual tools
export {
  // File operations
  readFile, writeFile, appendToFile, deleteFile, moveFile, copyFile
} from './fileOperations';

export {
  // Directory operations
  listDirectory, createDirectory, deleteDirectory
} from './directoryOperations';

export {
  // Utility operations
  getStats, exists, openFile
} from './utilityOperations';

// Export core utilities
export { validatePath, BASE_PATH, FileSystemResponse, isRunningInDocker, logEnvironmentInfo } from './utils';

// Import BASE_PATH for dynamic system prompt
import { BASE_PATH } from './utils';

/**
 * Collects all file system tools into a single object
 */
export function createFileSystemTools() {
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
 * System prompt for the File System Agent
 */
const SYSTEM_PROMPT = `You are a File System Agent that provides safe, sandboxed file system operations.
Follow these rules strictly:
- Use tree command output to understand directory structure
- Respond to user as soon as you have the answer
- Your default location for creating file / folder etc... is the desktop which is located at ${BASE_PATH}/Desktop, absolute files must start with ${BASE_PATH}
`;

/**
 * Create a File System Agent that provides safe, sandboxed file system operations
 * restricted to the appropriate base path determined by the runtime environment
 */
export function createFileSystemAgent(abortController: AbortController) {
  // Log the environment configuration on initialization
  logEnvironmentInfo();

  // Get directory tree for BASE_PATH
  const getConfigTreePrompt = async () => {
    try {
      const { stdout } = await execAsync(`tree -L 3 "${BASE_PATH}"`);
      return `
Here is the directory structure of the ${BASE_PATH} directory for context:
${stdout}`;
    } catch (err) {
      console.error(`Failed to get tree of ${BASE_PATH} directory:`, err);
      return '';
    }
  };

  const fsTools = createFileSystemTools();

  return tool({
    description: `A secure File System Agent that can perform filesystem operation and returns a summary of the work it completes`,
    parameters: z.object({
      instruction: z.string().describe('Natural language instruction for the file-system operation to perform')
    }),
    execute: async ({ instruction }) => {
      const tools: ToolSet = fsTools;

      // Get dynamic tree configuration
      const configTreePrompt = await getConfigTreePrompt();
      const dynamicSystemPrompt = `${SYSTEM_PROMPT}${configTreePrompt}`;

      // Use generateText to process the instruction and execute file system operations
      const { text, toolResults, steps } = await generateText({
        model: anthropic("claude-sonnet-4-20250514"),
        system: dynamicSystemPrompt,
        maxSteps: 5,
        tools: tools,
        toolChoice: 'auto',
        abortSignal: abortController.signal,
        messages: [
          {
            role: 'user',
            content: instruction
          }
        ],
      });

      return text;
    }
  });
}