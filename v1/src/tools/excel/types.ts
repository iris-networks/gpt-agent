import { z } from 'zod';

// Define the input schema for the Excel tool
export const ExcelToolInput = z.object({
  sheetName: z.string().describe('The name of the Excel sheet to create or manipulate'),
  operation: z.enum(['read', 'write', 'create', 'update', 'delete']).describe('The operation to perform on the Excel sheet'),
  data: z.record(z.any()).optional().describe('The data to write to the Excel sheet (for write/create/update operations)'),
  filters: z.record(z.any()).optional().describe('Filters to apply when reading or updating data'),
});

export type ExcelToolInputType = z.infer<typeof ExcelToolInput>;

export type ExcelOperation = 'read' | 'write' | 'create' | 'update' | 'delete';

export interface ExcelResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
}