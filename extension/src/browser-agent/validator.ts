/**
 * Schema validation utilities for the ReactAgent
 */

// External imports
import { z } from 'zod';

// Internal imports
import { Tool } from './types';

/**
 * Error class for tool input validation failures
 */
export class ToolInputValidationError extends Error {
  /**
   * @param message - Error message
   * @param toolName - Name of the tool that had the validation error
   * @param input - The input object that failed validation
   * @param validationErrors - The Zod validation error details
   */
  constructor(
    message: string, 
    public toolName: string, 
    public input: any, 
    public validationErrors: z.ZodError
  ) {
    super(message);
    this.name = 'ToolInputValidationError';
  }
}

/**
 * Validates tool input against its Zod schema
 * 
 * @param tool - The tool whose input schema will be used for validation
 * @param input - The input object to validate
 * @returns The validated input (possibly with transformations applied by Zod)
 * @throws {ToolInputValidationError} If the input fails schema validation
 */
export function validateToolInput(tool: Tool, input: any): any {
  try {
    // Parse and validate the input against the tool's schema
    return tool.inputSchema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format the validation errors into a readable message
      const formattedErrors = error.errors.map(err => {
        return `- ${err.path.join('.')}: ${err.message}`;
      }).join('\n');
      
      throw new ToolInputValidationError(
        `Invalid input for tool "${tool.name}":\n${formattedErrors}`,
        tool.name,
        input,
        error
      );
    }
    
    // Re-throw any other errors
    throw error;
  }
}