import { tool } from 'ai';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { BaseTool } from './base/BaseTool';
import { AgentStatusCallback } from '../agent_v2/types';
import { StatusEnum } from '@app/packages/ui-tars/shared/src/types';
import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';
import { homedir } from 'os';

interface ExcelAgentOptions {
  statusCallback: AgentStatusCallback;
  abortController: AbortController;
}

interface ExcelContext {
  workbook: ExcelJS.Workbook;
  worksheet: ExcelJS.Worksheet;
  filePath: string;
  headers: string[];
  currentRow: number;
  lastRow: number;
}

@Injectable()
export class ExcelAgent extends BaseTool {
  private context: ExcelContext | null = null;

  constructor(options: ExcelAgentOptions) {
    super({
      statusCallback: options.statusCallback,
      abortController: options.abortController
    });
  }

  /**
   * Helper function to get file path from excelId
   */
  private getFilePathFromId(excelId: string): string | null {
    const filesDir = process.env.IS_CONTAINERIZED === 'true' 
      ? '/config/files' 
      : path.join(homedir(), '.iris', 'files');
    const metadataPath = path.join(filesDir, `${excelId}.json`);

    if (!fs.existsSync(metadataPath)) {
      return null;
    }

    try {
      const rawData = fs.readFileSync(metadataPath, 'utf8');
      const metadata = JSON.parse(rawData);
      return fs.existsSync(metadata.filePath) ? metadata.filePath : null;
    } catch (error) {
      console.error(`Error reading metadata for excelId ${excelId}:`, error);
      return null;
    }
  }

  /**
   * Extract headers from worksheet
   */
  private getHeaders(worksheet: ExcelJS.Worksheet): string[] {
    const headers: string[] = [];
    const headerRow = worksheet.getRow(1);
    
    headerRow.eachCell((cell, colNumber) => {
      headers[colNumber - 1] = cell.value?.toString() || `Column${colNumber}`;
    });
    
    return headers;
  }

  /**
   * Initialize or switch Excel file context
   */
  private async initializeContext(
    excelIdOrPath: string,
    sheetName?: string,
    createIfNotExists: boolean = false
  ): Promise<{ success: boolean; error?: string }> {
    try {
      let filePath = this.getFilePathFromId(excelIdOrPath) || excelIdOrPath;
      
      // Create new file if it doesn't exist and createIfNotExists is true
      if (!fs.existsSync(filePath) && createIfNotExists) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(sheetName || 'Sheet1');
        await workbook.xlsx.writeFile(filePath);
        this.emitStatus(`Created new Excel file: ${filePath}`, StatusEnum.RUNNING);
      }
      
      if (!fs.existsSync(filePath)) {
        return { success: false, error: `Excel file not found: ${excelIdOrPath}` };
      }

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);

      const worksheet = sheetName
        ? workbook.getWorksheet(sheetName)
        : workbook.worksheets[0];

      if (!worksheet) {
        return { success: false, error: `Worksheet ${sheetName || 'at index 0'} not found` };
      }

      const headers = this.getHeaders(worksheet);
      const lastRow = worksheet.rowCount;

      this.context = {
        workbook,
        worksheet,
        filePath,
        headers,
        currentRow: 2, // Start after headers
        lastRow
      };

      this.emitStatus(`Excel context initialized for ${path.basename(filePath)}`, StatusEnum.RUNNING);
      return { success: true };
    } catch (error) {
      return { success: false, error: `Failed to initialize Excel context: ${error.message}` };
    }
  }

  /**
   * Save current context to file
   */
  private async saveContext(): Promise<{ success: boolean; error?: string }> {
    if (!this.context) {
      return { success: false, error: 'No Excel context initialized' };
    }

    try {
      await this.context.workbook.xlsx.writeFile(this.context.filePath);
      this.emitStatus(`Excel file saved: ${path.basename(this.context.filePath)}`, StatusEnum.RUNNING);
      return { success: true };
    } catch (error) {
      return { success: false, error: `Failed to save Excel file: ${error.message}` };
    }
  }

  /**
   * Execute Excel operations with context awareness
   */
  private async executeExcelOperation(
    operation: string,
    excelIdOrPath?: string,
    sheetName?: string,
    rowIndex?: number,
    data?: Record<string, any>,
    query?: Record<string, any>,
    createIfNotExists?: boolean
  ): Promise<any> {
    this.emitStatus(`Executing Excel operation: ${operation}`, StatusEnum.RUNNING);

    try {
      // Initialize context if needed or if switching files
      if (!this.context || (excelIdOrPath && this.context.filePath !== (this.getFilePathFromId(excelIdOrPath) || excelIdOrPath))) {
        const initResult = await this.initializeContext(excelIdOrPath!, sheetName, createIfNotExists);
        if (!initResult.success) {
          return { success: false, error: initResult.error };
        }
      }

      const ctx = this.context!;

      switch (operation) {
        case 'openFile':
          // Context already initialized above
          return {
            success: true,
            message: `Excel file opened: ${path.basename(ctx.filePath)}`,
            data: {
              fileName: path.basename(ctx.filePath),
              sheetName: ctx.worksheet.name,
              headers: ctx.headers,
              rowCount: ctx.lastRow,
              currentRow: ctx.currentRow
            }
          };

        case 'createFile':
          return {
            success: true,
            message: `Excel file created: ${path.basename(ctx.filePath)}`,
            data: {
              fileName: path.basename(ctx.filePath),
              filePath: ctx.filePath,
              sheetName: ctx.worksheet.name
            }
          };

        case 'getHeaders':
          return {
            success: true,
            data: { headers: ctx.headers }
          };

        case 'getCurrentRow':
          return {
            success: true,
            data: { currentRow: ctx.currentRow }
          };

        case 'setCurrentRow':
          if (rowIndex === undefined) {
            return { success: false, error: 'Row index is required' };
          }
          ctx.currentRow = Math.max(1, Math.min(rowIndex, ctx.lastRow + 1));
          return {
            success: true,
            data: { currentRow: ctx.currentRow }
          };

        case 'getNextRow':
          if (ctx.currentRow > ctx.lastRow) {
            return { success: false, error: 'No more rows available' };
          }
          
          const nextRow = ctx.worksheet.getRow(ctx.currentRow);
          const rowData: Record<string, any> = { rowId: ctx.currentRow };
          
          ctx.headers.forEach((header, index) => {
            rowData[header] = nextRow.getCell(index + 1).value;
          });
          
          ctx.currentRow++;
          return {
            success: true,
            data: { row: rowData, nextCurrentRow: ctx.currentRow }
          };

        case 'readRow':
          const targetRow = rowIndex || ctx.currentRow;
          if (targetRow > ctx.lastRow) {
            return { success: false, error: `Row ${targetRow} doesn't exist` };
          }
          
          const row = ctx.worksheet.getRow(targetRow);
          const readData: Record<string, any> = { rowId: targetRow };
          
          ctx.headers.forEach((header, index) => {
            readData[header] = row.getCell(index + 1).value;
          });
          
          return {
            success: true,
            data: { row: readData }
          };

        case 'insertRow':
          if (!data || Object.keys(data).length === 0) {
            return { success: false, error: 'Data is required for insertRow' };
          }

          const insertIndex = rowIndex || ctx.currentRow;
          const insertRow = ctx.worksheet.getRow(insertIndex);
          
          // If inserting beyond last row, update headers if this is row 1
          if (insertIndex === 1) {
            ctx.headers = Object.keys(data);
            ctx.headers.forEach((header, index) => {
              insertRow.getCell(index + 1).value = header;
            });
            insertRow.commit();
            ctx.lastRow = Math.max(ctx.lastRow, insertIndex);
            ctx.currentRow = insertIndex + 1;
          } else {
            // Insert data row
            ctx.headers.forEach((header, index) => {
              if (data.hasOwnProperty(header)) {
                insertRow.getCell(index + 1).value = data[header];
              }
            });
            insertRow.commit();
            ctx.lastRow = Math.max(ctx.lastRow, insertIndex);
            ctx.currentRow = insertIndex + 1;
          }
          
          const saveResult = await this.saveContext();
          if (!saveResult.success) {
            return { success: false, error: saveResult.error };
          }
          
          return {
            success: true,
            data: { 
              rowInserted: insertIndex,
              nextCurrentRow: ctx.currentRow,
              newRowCount: ctx.lastRow
            }
          };

        case 'updateRow':
          if (!data || Object.keys(data).length === 0) {
            return { success: false, error: 'Data is required for updateRow' };
          }
          
          const updateIndex = rowIndex || ctx.currentRow;
          if (updateIndex > ctx.lastRow) {
            return { success: false, error: `Row ${updateIndex} doesn't exist` };
          }
          
          const updateRow = ctx.worksheet.getRow(updateIndex);
          
          ctx.headers.forEach((header, index) => {
            if (data.hasOwnProperty(header)) {
              updateRow.getCell(index + 1).value = data[header];
            }
          });
          
          updateRow.commit();
          
          const updateSaveResult = await this.saveContext();
          if (!updateSaveResult.success) {
            return { success: false, error: updateSaveResult.error };
          }
          
          return {
            success: true,
            data: { rowUpdated: updateIndex }
          };

        case 'queryRows':
          if (!query || Object.keys(query).length === 0) {
            return { success: false, error: 'Query is required for queryRows' };
          }
          
          const queryColumns = Object.keys(query);
          const matchingRows: Record<string, any>[] = [];
          
          // Validate query columns
          for (const column of queryColumns) {
            if (!ctx.headers.includes(column)) {
              return { success: false, error: `Query column "${column}" not found in headers` };
            }
          }
          
          ctx.worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header row
            
            let isMatch = true;
            for (const column of queryColumns) {
              const columnIndex = ctx.headers.indexOf(column) + 1;
              const cellValue = row.getCell(columnIndex).value;
              
              // Simple equality check (can be enhanced with fuzzy matching)
              if (cellValue?.toString().toLowerCase() !== query[column]?.toString().toLowerCase()) {
                isMatch = false;
                break;
              }
            }
            
            if (isMatch) {
              const rowData: Record<string, any> = { rowId: rowNumber };
              ctx.headers.forEach((header, index) => {
                rowData[header] = row.getCell(index + 1).value;
              });
              matchingRows.push(rowData);
            }
          });
          
          return {
            success: true,
            data: { rows: matchingRows, count: matchingRows.length }
          };

        case 'getFileInfo':
          return {
            success: true,
            data: {
              fileName: path.basename(ctx.filePath),
              filePath: ctx.filePath,
              sheetName: ctx.worksheet.name,
              headers: ctx.headers,
              rowCount: ctx.lastRow,
              currentRow: ctx.currentRow
            }
          };

        case 'save':
          const saveFileResult = await this.saveContext();
          return saveFileResult.success 
            ? { success: true, message: 'File saved successfully' }
            : { success: false, error: saveFileResult.error };

        default:
          return { success: false, error: `Unknown operation: ${operation}` };
      }
    } catch (error) {
      this.emitStatus(`Excel operation failed: ${error.message}`, StatusEnum.ERROR);
      return { success: false, error: `Excel operation failed: ${error.message}` };
    }
  }

  /**
   * Get the AI SDK tool definition
   */
  getToolDefinition() {
    return tool({
      description: 'Context-aware Excel agent that maintains file state across operations. Supports methods like getNextRow, insertRow, updateRow, queryRows, etc.',
      parameters: z.object({
        operation: z.enum([
          'openFile',
          'createFile', 
          'getHeaders',
          'getCurrentRow',
          'setCurrentRow',
          'getNextRow',
          'readRow',
          'insertRow',
          'updateRow',
          'queryRows',
          'getFileInfo',
          'save'
        ]).describe('The Excel operation to perform'),

        excelIdOrPath: z.string()
          .optional()
          .describe('Excel file ID or path. Required for openFile and createFile operations'),

        sheetName: z.string()
          .optional()
          .describe('Name of the worksheet to operate on (defaults to first sheet)'),

        rowIndex: z.number()
          .optional()
          .describe('1-based row index for operations that target specific rows'),

        data: z.record(z.any())
          .optional()
          .describe('Data object with column names and values for insertRow and updateRow operations'),

        query: z.record(z.any())
          .optional()
          .describe('Query criteria for queryRows operation'),

        createIfNotExists: z.boolean()
          .optional()
          .default(false)
          .describe('Create file if it doesn\'t exist (for createFile operation)')
      }),
      execute: async ({ operation, excelIdOrPath, sheetName, rowIndex, data, query, createIfNotExists }) => {
        return this.executeExcelOperation(
          operation,
          excelIdOrPath,
          sheetName,
          rowIndex,
          data,
          query,
          createIfNotExists
        );
      }
    });
  }
}