import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

/**
 * Checks if the application is running inside a Docker container or Kubernetes pod
 * @returns true if running in Docker/Kubernetes, false otherwise
 */
export const isRunningInDocker = (): boolean => {
  const isContainerized = process.env.IS_CONTAINERIZED === 'true';
  console.log(`Container detection: ${isContainerized ? 'containerized' : 'local'}`);
  return isContainerized;
};

// Base path that all operations are restricted to
// This determines the root directory for all file operations
const determinePath = (): string => {
  if (isRunningInDocker()) {
    // Use Docker-specific path when running in a container
    return '/config';
  } else {
    // Use local path in user's home directory when not in Docker
    const irisPath = path.join(os.homedir(), '.iris');

    // Create the directory if it doesn't exist
    if (!fs.existsSync(irisPath)) {
      try {
        fs.mkdirSync(irisPath, { recursive: true });
        console.log(`Created directory: ${irisPath}`);
      } catch (error) {
        console.error(`Failed to create directory ${irisPath}:`, error);
      }
    }

    return irisPath;
  }
};

export const BASE_PATH = determinePath();

/**
 * Validates and normalizes a path to ensure it stays within the allowed BASE_PATH
 * @param inputPath - The path to validate (must be absolute and start with BASE_PATH)
 * @returns Normalized absolute path if valid, throws error if outside BASE_PATH
 */
export const validatePath = (inputPath: string): string => {
  // Check if path is absolute
  if (!path.isAbsolute(inputPath)) {
    throw new Error(`Unauthorized: Path must be absolute, got: ${inputPath}`);
  }

  // Ensure the path starts with BASE_PATH
  if (!inputPath.startsWith(BASE_PATH)) {
    throw new Error(`Unauthorized: Path must start with ${BASE_PATH}, got: ${inputPath}`);
  }

  const normalizedPath = inputPath;

  // Check if the directory part of the path exists, create it if it doesn't
  const dirPath = path.dirname(normalizedPath);
  if (!fs.existsSync(dirPath)) {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Created directory: ${dirPath}`);
    } catch (error) {
      console.error(`Failed to create directory ${dirPath}:`, error);
      throw new Error(`Failed to create directory ${dirPath}: ${error}`);
    }
  }

  return normalizedPath;
};

/**
 * Standard response format for file system operations
 */
export interface FileSystemResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Helper to create a success response
 */
export const createSuccessResponse = <T>(data?: T, message?: string): FileSystemResponse<T> => ({
  success: true,
  ...(data !== undefined ? { data } : {}),
  ...(message ? { message } : {})
});

/**
 * Helper to create an error response
 */
export const createErrorResponse = (error: Error | string): FileSystemResponse => ({
  success: false,
  error: typeof error === 'string' ? error : error.message || 'Unknown error occurred'
});

/**
 * Safely execute a file system operation with error handling
 */
export const safeExecute = async <T>(
  operation: () => Promise<T>,
  errorMessage: string = 'Operation failed'
): Promise<FileSystemResponse<T>> => {
  try {
    const result = await operation();
    return createSuccessResponse(result);
  } catch (error: any) {
    return createErrorResponse(error.message || errorMessage);
  }
};

/**
 * Log the current environment detection and path configuration
 * This is useful for debugging path-related issues
 */
export const logEnvironmentInfo = (): void => {
  const inDocker = isRunningInDocker();
  console.log('===== Environment Configuration =====');
  console.log(`Running in Docker: ${inDocker ? 'Yes' : 'No'}`);
  console.log(`Base path: ${BASE_PATH}`);
  console.log(`User home directory: ${os.homedir()}`);
  console.log('====================================');
};

/**
 * Write messages to a JSON file with metadata
 * @param filePath - The path to the JSON file
 * @param iteration - Current iteration number
 * @param messages - Array of messages to process
 */
export const writeMessagesToFile = (filePath: string, iteration: number, messages: any[]): void => {
  const data = {
    timestamp: new Date().toISOString(),
    iteration: iteration,
    messages: messages
  };

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};