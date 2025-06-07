
import { Operator } from '@app/packages/ui-tars/sdk/src/types';
import { StatusEnum } from '@app/packages/ui-tars/shared/src/types';
import { Tool, ToolSet } from 'ai';
import { z } from 'zod';

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

// Types for planning and execution
export interface PlanningResult {
    updatedPlan: string[];
    summary: string;
}

export interface StepResult {
    toolName: string;
    success: boolean;
    result?: any;
    error?: string;
}

export interface ToolExecutionResult {
    step: number;
    action: string;
    results: StepResult[];
}

// Base agent interface
export interface IAgent {
    operator: Operator;
    tools: ToolSet;
    agentStatusCallback?: AgentStatusCallback;
    execute(params: ExecuteInput): Promise<void>;

    // Set status callback
    setStatusCallback(callback: AgentStatusCallback): void;
}