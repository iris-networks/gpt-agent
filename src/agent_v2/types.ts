import { z } from 'zod';
import { StatusEnum } from '@app/packages/ui-tars/shared/src/types';

// Re-export commonly used types
export { ToolCall, ToolResult } from '@ai-sdk/provider-utils';

// File metadata interface
export interface FileMetadata {
    fileId: string;
    fileName: string;
    originalName?: string;
    mimeType: string;
    fileSize: number;
}

// Define the execute input schema
export const ExecuteInputSchema = z.object({
    maxSteps: z.number().int().positive().describe("Maximum number of steps to execute"),
    input: z.string().min(1).describe("User input to process"),
    files: z.array(z.object({
        fileId: z.string(),
        fileName: z.string(),
        originalName: z.string().optional(),
        mimeType: z.string(),
        fileSize: z.number()
    })).optional().describe("Array of file metadata that can be used by tools")
});

// Type for the execute input
export type ExecuteInput = z.infer<typeof ExecuteInputSchema>;

// Agent status callback type
export type AgentStatusCallback = (message: string, status: StatusEnum, data?: any) => void;