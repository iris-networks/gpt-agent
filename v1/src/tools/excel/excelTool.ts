import { z } from 'zod';
import { DynamicTool, StringToolOutput } from 'beeai-framework';
import { createExcel } from './operations/createExcel';
import { readExcel } from './operations/readExcel';
import { updateExcel } from './operations/updateExcel';
import { deleteExcel } from './operations/deleteExcel';

export const ExcelTool = new DynamicTool({
  name: "ExcelTool",
  description: "Manages Excel files with operations like create, read, update and delete",
  inputSchema: z.object({
    action: z.enum(['create', 'read', 'update', 'delete']).describe('Action to perform on Excel file'),
    filePath: z.string().describe('Path to the Excel file'),
    sheetName: z.string().optional().describe('Name of the sheet to operate on'),
    data: z.any().optional().describe('Data for create or update operations'),
    range: z.string().optional().describe('Cell range for read or update operations (e.g., "A1:C5")'),
    options: z.object({}).passthrough().optional().describe('Additional options for the operation')
  }),
  async handler({ action, filePath, sheetName, data, range, options }) {
    try {
      let result;
      
      switch (action) {
        case 'create':
          result = await createExcel(filePath, data, sheetName, options);
          break;
        case 'read':
          result = await readExcel(filePath, sheetName, range, options);
          break;
        case 'update':
          result = await updateExcel(filePath, data, sheetName, range, options);
          break;
        case 'delete':
          result = await deleteExcel(filePath, sheetName, range, options);
          break;
      }

      return new StringToolOutput(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Excel operation error:', error);
      return new StringToolOutput(JSON.stringify({ 
        error: true, 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }, null, 2));
    }
  },
});