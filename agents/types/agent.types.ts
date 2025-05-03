import { Tool, ToolSet } from 'ai';
import { Operator } from '@ui-tars/sdk/dist/types';
import { z } from 'zod';

// Define the execute input schema
export const ExecuteInputSchema = z.object({
    maxSteps: z.number().int().positive().describe("Maximum number of steps to execute"),
    input: z.string().min(1).describe("User input to process")
});

// Type for the execute input
export type ExecuteInput = z.infer<typeof ExecuteInputSchema>;

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
    execute(params: ExecuteInput): Promise<void>;
}