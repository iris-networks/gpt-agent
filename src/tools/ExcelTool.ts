import { tool } from 'ai';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { BaseTool } from './base/BaseTool';
import { AgentStatusCallback } from '../agent_v2/types';
import { StatusEnum } from '@app/packages/ui-tars/shared/src/types';
import { 
  describeExcelFile, 
  readRowByIndex, 
  queryRows, 
  writeRowByIndex, 
  updateRowsByQuery 
} from '../../tools/excel/operations';
import { ExcelOperation } from '../../tools/excel/types';

interface ExcelToolOptions {
  statusCallback: AgentStatusCallback;  // MANDATORY
  abortController: AbortController;     // MANDATORY
}

@Injectable()
export class ExcelTool extends BaseTool {
  constructor(options: ExcelToolOptions) {
    super({
      statusCallback: options.statusCallback,
      abortController: options.abortController
    });
  }

  /**
   * Execute Excel operation with status updates
   */
  private async executeExcelOperation(
    operation: ExcelOperation,
    excelId: string,
    rowIndex?: number,
    query?: Record<string, any>,
    data?: Record<string, any>,
    sheetName?: string,
    sampleRows: number = 3
  ): Promise<any> {
    this.emitStatus(`Starting Excel operation: ${operation} on file ${excelId}`, StatusEnum.RUNNING);

    try {
      switch (operation) {
        case 'describe':
          this.emitStatus(`Describing Excel file structure: ${excelId}`, StatusEnum.RUNNING);
          const describeResult = await describeExcelFile(excelId, sampleRows);
          this.emitStatus(`Excel file description completed with ${sampleRows} sample rows`, StatusEnum.RUNNING);
          return describeResult;

        case 'read':
          if (rowIndex === undefined) {
            this.emitStatus('Excel read operation failed: Row index is required', StatusEnum.ERROR);
            return {
              success: false,
              error: 'Row index is required for read operation',
              data: null
            };
          }
          this.emitStatus(`Reading row ${rowIndex} from Excel file: ${excelId}`, StatusEnum.RUNNING);
          const readResult = await readRowByIndex(excelId, rowIndex, sheetName);
          this.emitStatus(`Excel row read completed successfully`, StatusEnum.RUNNING);
          return readResult;

        case 'query':
          if (!query || Object.keys(query).length === 0) {
            this.emitStatus('Excel query operation failed: Query is required', StatusEnum.ERROR);
            return {
              success: false,
              error: 'Query is required for query operation',
              data: null
            };
          }
          const queryKeys = Object.keys(query);
          this.emitStatus(`Querying Excel file with ${queryKeys.length} criteria: ${queryKeys.join(', ')}`, StatusEnum.RUNNING);
          const queryResult = await queryRows(excelId, query, sheetName);
          this.emitStatus(`Excel query completed successfully`, StatusEnum.RUNNING);
          return queryResult;

        case 'write':
          if (rowIndex === undefined) {
            this.emitStatus('Excel write operation failed: Row index is required', StatusEnum.ERROR);
            return {
              success: false,
              error: 'Row index is required for write operation',
              rowsUpdated: 0
            };
          }
          if (!data || Object.keys(data).length === 0) {
            this.emitStatus('Excel write operation failed: Data is required', StatusEnum.ERROR);
            return {
              success: false,
              error: 'Data is required for write operation',
              rowsUpdated: 0
            };
          }
          const writeKeys = Object.keys(data);
          this.emitStatus(`Writing to row ${rowIndex} with ${writeKeys.length} columns: ${writeKeys.join(', ')}`, StatusEnum.RUNNING);
          const writeResult = await writeRowByIndex(excelId, rowIndex, data, sheetName);
          this.emitStatus(`Excel write operation completed successfully`, StatusEnum.RUNNING);
          return writeResult;

        case 'update':
          if (!query || Object.keys(query).length === 0) {
            this.emitStatus('Excel update operation failed: Query is required', StatusEnum.ERROR);
            return {
              success: false,
              error: 'Query is required for update operation',
              rowsUpdated: 0
            };
          }
          if (!data || Object.keys(data).length === 0) {
            this.emitStatus('Excel update operation failed: Data is required', StatusEnum.ERROR);
            return {
              success: false,
              error: 'Data is required for update operation',
              rowsUpdated: 0
            };
          }
          const updateQueryKeys = Object.keys(query);
          const updateDataKeys = Object.keys(data);
          this.emitStatus(`Updating Excel rows matching ${updateQueryKeys.length} criteria with ${updateDataKeys.length} columns`, StatusEnum.RUNNING);
          const updateResult = await updateRowsByQuery(excelId, query, data, sheetName);
          this.emitStatus(`Excel update operation completed successfully`, StatusEnum.RUNNING);
          return updateResult;
          
        default:
          this.emitStatus(`Unknown Excel operation: ${operation}`, StatusEnum.ERROR);
          return {
            success: false,
            error: `Unknown operation: ${operation}`,
            data: null
          };
      }
    } catch (error) {
      this.emitStatus(`Excel operation failed: ${error.message}`, StatusEnum.ERROR, { error });
      return {
        success: false,
        error: `Excel operation failed: ${error.message}`,
        data: null
      };
    }
  }

  /**
   * Get the AI SDK tool definition
   */
  getToolDefinition() {
    return tool({
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
        return this.executeExcelOperation(operation as ExcelOperation, excelId, rowIndex, query, data, sheetName, sampleRows);
      }
    });
  }
}