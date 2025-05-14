import { tool } from 'ai';
import { z } from 'zod';
import { 
  describeExcelFile, 
  readRowByIndex, 
  queryRows, 
  writeRowByIndex, 
  updateRowsByQuery 
} from './excel/operations';
import { ExcelOperation } from './excel/types';

/**
 * Excel Tool - Manage Excel files with read, query, and write operations
 * 
 * This tool provides a unified interface for working with Excel files
 * including describing structure, reading, querying, and updating data.
 */
export const excelTool = tool({
  description: 'Manage Excel files with read, query, and write operations',
  parameters: z.object({
    operation: z.enum(['describe', 'read', 'query', 'write', 'update'])
      .describe('The Excel operation to perform - describe structure, read a row, query for rows, write data, or update matching rows'),

    excelId: z.string()
      .describe('Excel ID for the file to operate on. Can be obtained from the excel upload API response. Alternatively, a direct file path can also be used.'),

    rowIndex: z.number()
      .optional()
      .describe('1-based index of the row to read or write (required for read and write operations)'),

    query: z.record(z.any())
      .optional()
      .describe('Object with column names and values to match. Case-insensitive for strings. Example: { Department: "engineering", Status: "active" }'),

    data: z.record(z.any())
      .optional()
      .describe('Object with column names and values to write (required for write and update operations)'),

    sheetName: z.string()
      .optional()
      .describe('Name of the worksheet to operate on (defaults to first sheet if not provided)'),

    sampleRows: z.number()
      .optional()
      .default(3)
      .describe('Number of sample rows to include in describe operation (defaults to 3)')
  }),
  execute: async ({ operation, excelId, rowIndex, query, data, sheetName, sampleRows = 3 }) => {
    console.log(`Executing Excel ${operation} operation on file with ID/path: ${excelId}`);

    try {
      switch (operation as ExcelOperation) {
        case 'describe':
          return await describeExcelFile(excelId, sampleRows);

        case 'read':
          if (rowIndex === undefined) {
            return {
              success: false,
              error: 'Row index is required for read operation',
              data: null
            };
          }
          return await readRowByIndex(excelId, rowIndex, sheetName);

        case 'query':
          if (!query || Object.keys(query).length === 0) {
            return {
              success: false,
              error: 'Query is required for query operation',
              data: null
            };
          }
          return await queryRows(excelId, query, sheetName);

        case 'write':
          if (rowIndex === undefined) {
            return {
              success: false,
              error: 'Row index is required for write operation',
              rowsUpdated: 0
            };
          }
          if (!data || Object.keys(data).length === 0) {
            return {
              success: false,
              error: 'Data is required for write operation',
              rowsUpdated: 0
            };
          }
          return await writeRowByIndex(excelId, rowIndex, data, sheetName);

        case 'update':
          if (!query || Object.keys(query).length === 0) {
            return {
              success: false,
              error: 'Query is required for update operation',
              rowsUpdated: 0
            };
          }
          if (!data || Object.keys(data).length === 0) {
            return {
              success: false,
              error: 'Data is required for update operation',
              rowsUpdated: 0
            };
          }
          return await updateRowsByQuery(excelId, query, data, sheetName);
          
        default:
          return {
            success: false,
            error: `Unknown operation: ${operation}`,
            data: null
          };
      }
    } catch (error) {
      return {
        success: false,
        error: `Excel operation failed: ${error.message}`,
        data: null
      };
    }
  }
});