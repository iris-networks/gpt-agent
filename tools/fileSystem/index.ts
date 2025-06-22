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
- Remember that socket files in .gnupg/ directory (S.gpg-agent*) should not have their permissions changed
`;

/**
 * Create a File System Agent that provides safe, sandboxed file system operations
 * restricted to the appropriate base path determined by the runtime environment
 */
export function createFileSystemAgent(abortController: AbortController) {
  // Log the environment configuration on initialization
  logEnvironmentInfo();

  // Get directory tree for /config if in Docker
  const getConfigTreePrompt = async () => {
    if (isRunningInDocker()) {
      try {
        const { stdout } = await execAsync('tree -L 3 /config');
        return `
Here is the directory structure of the /config directory for context:
\`\`\`
${stdout}
\`\`\`

The socket files in /config/.gnupg/ (S.gpg-agent*) should not have their permissions changed, as these are special files used for GPG agent communication.`;
      } catch (err) {
        console.error('Failed to get tree of /config directory:', err);
        return '';
      }
    }
    return '';
  };

  const fsTools = createFileSystemTools();

  return tool({
    description: 'File System Agent that provides safe, sandboxed file and folder operations. Can combine all of the following actions to perform a complex task: readFile, writeFile, appendToFile, deleteFile, moveFile, copyFile, listDirectory, createDirectory, deleteDirectory, getStats, exists, openFile.',
    parameters: z.object({
      instruction: z.string().describe('Natural language instruction for all file system operations.')
    }),
    execute: async ({ instruction }) => {
      const tools: ToolSet = fsTools;

      // Get dynamic tree configuration
      const configTreePrompt = await getConfigTreePrompt();
      const dynamicSystemPrompt = `${SYSTEM_PROMPT}${configTreePrompt}`;

      // Use generateText to process the instruction and execute file system operations
      const { text, toolResults, steps } = await generateText({
        model: anthropic("claude-3-5-sonnet-20241022"),
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
        onStepFinish: ({ text, toolCalls, toolResults, finishReason, usage }) => {
          console.log(JSON.stringify({ text, toolCalls, toolResults, finishReason, usage }));
        }
      });

      return text + JSON.stringify(toolResults);
    }
  });
}