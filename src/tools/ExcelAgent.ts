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
import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

interface ExcelAgentOptions {
  statusCallback: AgentStatusCallback;
  abortController: AbortController;
}

@Injectable()
export class ExcelAgent extends BaseTool {
  private workbook: ExcelJS.Workbook | null = null;
  private currentFilePath: string | null = null;
  private worksheetCache: Map<string, ExcelJS.Worksheet> = new Map();

  constructor(options: ExcelAgentOptions) {
    super({
      statusCallback: options.statusCallback,
      abortController: options.abortController
    });
  }

  getToolDefinition() {
    return tool({
      description: 'Context-aware Excel agent that maintains file state across operations. Supports surgical operations like getNextRow, insertRow, updateRow, queryRows, etc.',
      parameters: z.object({
        instruction: z.string().describe(
          `A high-level command that can be completed through exceljs utils.`
        ),
        maxSteps: z.number().describe('The maximum number of steps it would take a user with terminal access.').min(2).max(10),
      }),
      execute: async ({ instruction, maxSteps }) => {
        return this.executeInstruction(instruction, maxSteps);
      }
    });
  }

  private async executeInstruction(instruction: string, maxSteps: number): Promise<string> {
    this.emitStatus('Starting Excel operation', StatusEnum.RUNNING);

    try {
      const result = streamText({
        model: anthropic('claude-sonnet-4-20250514'),
        tools: this.createExcelTools(),
        messages: [
          { role: 'system', content: this.getSystemPrompt() },
          { role: 'user', content: instruction }
        ],
        maxSteps: maxSteps,
        abortSignal: this.abortController.signal
      });

      let fullText = '';
      for await (const textPart of result.textStream) {
        fullText += textPart;
      }

      this.emitStatus('Excel operation completed', StatusEnum.END);
      return fullText;
    } catch (error) {
      this.emitStatus(`Excel operation failed: ${error.message}`, StatusEnum.ERROR);
      throw error;
    }
  }

  private createExcelTools() {
    return {
      // File Operations
      loadWorkbook: this.createLoadWorkbookTool(),
      saveWorkbook: this.createSaveWorkbookTool(),
      getWorkbookInfo: this.createGetWorkbookInfoTool(),
      
      // Worksheet Operations
      getWorksheetInfo: this.createGetWorksheetInfoTool(),
      createWorksheet: this.createCreateWorksheetTool(),
      deleteWorksheet: this.createDeleteWorksheetTool(),
      
      // Cell Operations
      getCellValue: this.createGetCellValueTool(),
      setCellValue: this.createSetCellValueTool(),
      getCellRange: this.createGetCellRangeTool(),
      setCellRange: this.createSetCellRangeTool(),
      
      // Row Operations
      getNextEmptyRow: this.createGetNextEmptyRowTool(),
      insertRow: this.createInsertRowTool(),
      updateRow: this.createUpdateRowTool(),
      deleteRow: this.createDeleteRowTool(),
      queryRows: this.createQueryRowsTool(),
      
      // Column Operations
      insertColumn: this.createInsertColumnTool(),
      updateColumn: this.createUpdateColumnTool(),
      deleteColumn: this.createDeleteColumnTool(),
      
      // Formatting Operations
      formatCells: this.createFormatCellsTool(),
      autoFitColumns: this.createAutoFitColumnsTool(),
      
      // Data Operations
      findAndReplace: this.createFindAndReplaceTool(),
      sortData: this.createSortDataTool(),
      filterData: this.createFilterDataTool(),
    };
  }

  private getSystemPrompt(): string {
    return `You are an expert Excel agent that performs surgical operations on Excel files.

Key principles:
1. Always load the workbook first before performing operations
2. Use specific tools for specific operations - don't do multiple operations in one tool
3. Provide detailed feedback about what was found/changed
4. Handle errors gracefully and provide clear error messages
5. Save changes when instructed to do so
6. Use the most efficient tool for each operation

Available tools:
- File: loadWorkbook, saveWorkbook, getWorkbookInfo
- Worksheet: getWorksheetInfo, createWorksheet, deleteWorksheet
- Cells: getCellValue, setCellValue, getCellRange, setCellRange
- Rows: getNextEmptyRow, insertRow, updateRow, deleteRow, queryRows
- Columns: insertColumn, updateColumn, deleteColumn
- Formatting: formatCells, autoFitColumns
- Data: findAndReplace, sortData, filterData

Always be precise and surgical in your operations.`;
  }

  // File Operations
  private createLoadWorkbookTool() {
    return tool({
      description: 'Load an Excel workbook from file path',
      parameters: z.object({
        filePath: z.string().describe('Path to the Excel file')
      }),
      execute: async ({ filePath }) => {
        try {
          const resolvedPath = path.resolve(filePath);
          if (!fs.existsSync(resolvedPath)) {
            throw new Error(`File not found: ${resolvedPath}`);
          }

          this.workbook = new ExcelJS.Workbook();
          await this.workbook.xlsx.readFile(resolvedPath);
          this.currentFilePath = resolvedPath;
          this.worksheetCache.clear();

          const worksheetNames = this.workbook.worksheets.map(ws => ws.name);
          return {
            success: true,
            message: `Loaded workbook: ${path.basename(resolvedPath)}`,
            worksheets: worksheetNames,
            filePath: resolvedPath
          };
        } catch (error) {
          throw new Error(`Failed to load workbook: ${error.message}`);
        }
      }
    });
  }

  private createSaveWorkbookTool() {
    return tool({
      description: 'Save the current workbook to file',
      parameters: z.object({
        filePath: z.string().optional().describe('Optional new file path (defaults to current file path)')
      }),
      execute: async ({ filePath }) => {
        if (!this.workbook) {
          throw new Error('No workbook loaded. Please load a workbook first.');
        }

        const saveToPath = filePath || this.currentFilePath;
        if (!saveToPath) {
          throw new Error('No file path specified and no current file path available.');
        }

        try {
          await this.workbook.xlsx.writeFile(saveToPath);
          this.currentFilePath = saveToPath;
          
          return {
            success: true,
            message: `Saved workbook to: ${path.basename(saveToPath)}`,
            filePath: saveToPath
          };
        } catch (error) {
          throw new Error(`Failed to save workbook: ${error.message}`);
        }
      }
    });
  }

  private createGetWorkbookInfoTool() {
    return tool({
      description: 'Get information about the current workbook',
      parameters: z.object({}),
      execute: async () => {
        if (!this.workbook) {
          throw new Error('No workbook loaded. Please load a workbook first.');
        }

        const worksheetInfo = this.workbook.worksheets.map(ws => ({
          name: ws.name,
          id: ws.id,
          rowCount: ws.rowCount,
          columnCount: ws.columnCount,
          actualRowCount: ws.actualRowCount,
          actualColumnCount: ws.actualColumnCount
        }));

        return {
          success: true,
          currentFilePath: this.currentFilePath,
          worksheetCount: this.workbook.worksheets.length,
          worksheets: worksheetInfo,
          creator: this.workbook.creator,
          lastModifiedBy: this.workbook.lastModifiedBy,
          created: this.workbook.created,
          modified: this.workbook.modified
        };
      }
    });
  }

  // Worksheet Operations
  private createGetWorksheetInfoTool() {
    return tool({
      description: 'Get information about a specific worksheet',
      parameters: z.object({
        worksheetName: z.string().describe('Name of the worksheet')
      }),
      execute: async ({ worksheetName }) => {
        const worksheet = this.getWorksheet(worksheetName);
        
        return {
          success: true,
          name: worksheet.name,
          id: worksheet.id,
          rowCount: worksheet.rowCount,
          columnCount: worksheet.columnCount,
          actualRowCount: worksheet.actualRowCount,
          actualColumnCount: worksheet.actualColumnCount,
          state: worksheet.state,
          tabColor: (worksheet as any).tabColor,
          headerFooter: worksheet.headerFooter
        };
      }
    });
  }

  private createCreateWorksheetTool() {
    return tool({
      description: 'Create a new worksheet',
      parameters: z.object({
        name: z.string().describe('Name for the new worksheet'),
        options: z.object({
          state: z.enum(['visible', 'hidden', 'veryHidden']).optional(),
          tabColor: z.string().optional().describe('Hex color for the tab')
        }).optional()
      }),
      execute: async ({ name, options = {} }) => {
        if (!this.workbook) {
          throw new Error('No workbook loaded. Please load a workbook first.');
        }

        try {
          const worksheet = this.workbook.addWorksheet(name, options);
          this.worksheetCache.set(name, worksheet);
          
          return {
            success: true,
            message: `Created worksheet: ${name}`,
            worksheetId: worksheet.id,
            worksheetName: name
          };
        } catch (error) {
          throw new Error(`Failed to create worksheet: ${error.message}`);
        }
      }
    });
  }

  private createDeleteWorksheetTool() {
    return tool({
      description: 'Delete a worksheet',
      parameters: z.object({
        worksheetName: z.string().describe('Name of the worksheet to delete')
      }),
      execute: async ({ worksheetName }) => {
        if (!this.workbook) {
          throw new Error('No workbook loaded. Please load a workbook first.');
        }

        const worksheet = this.getWorksheet(worksheetName);
        this.workbook.removeWorksheet(worksheet.id);
        this.worksheetCache.delete(worksheetName);
        
        return {
          success: true,
          message: `Deleted worksheet: ${worksheetName}`
        };
      }
    });
  }

  // Cell Operations
  private createGetCellValueTool() {
    return tool({
      description: 'Get the value of a specific cell',
      parameters: z.object({
        worksheetName: z.string().describe('Name of the worksheet'),
        cellReference: z.string().describe('Cell reference (e.g., A1, B2) or row,col numbers')
      }),
      execute: async ({ worksheetName, cellReference }) => {
        const worksheet = this.getWorksheet(worksheetName);
        const cell = worksheet.getCell(cellReference);
        
        return {
          success: true,
          cellReference,
          value: cell.value,
          text: cell.text,
          type: cell.type,
          formula: cell.formula,
          address: cell.address,
          fullAddress: cell.fullAddress
        };
      }
    });
  }

  private createSetCellValueTool() {
    return tool({
      description: 'Set the value of a specific cell',
      parameters: z.object({
        worksheetName: z.string().describe('Name of the worksheet'),
        cellReference: z.string().describe('Cell reference (e.g., A1, B2)'),
        value: z.any().describe('Value to set in the cell')
      }),
      execute: async ({ worksheetName, cellReference, value }) => {
        const worksheet = this.getWorksheet(worksheetName);
        const cell = worksheet.getCell(cellReference);
        cell.value = value;
        
        return {
          success: true,
          message: `Set cell ${cellReference} to: ${value}`,
          cellReference,
          value,
          address: cell.address
        };
      }
    });
  }

  private createGetCellRangeTool() {
    return tool({
      description: 'Get values from a range of cells',
      parameters: z.object({
        worksheetName: z.string().describe('Name of the worksheet'),
        range: z.string().describe('Cell range (e.g., A1:C3)')
      }),
      execute: async ({ worksheetName, range }) => {
        const worksheet = this.getWorksheet(worksheetName);
        const [, ] = range.split(':');
        const values: any[][] = [];
        
        // Simple range parsing using ExcelJS built-in methods
        const parseRange = (range: string) => {
          const [start, end] = range.split(':');
          const startMatch = start.match(/([A-Z]+)(\d+)/);
          const endMatch = end.match(/([A-Z]+)(\d+)/);
          
          if (!startMatch || !endMatch) throw new Error(`Invalid range: ${range}`);
          
          const startCol = startMatch[1].split('').reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 64, 0);
          const startRow = parseInt(startMatch[2]);
          const endCol = endMatch[1].split('').reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 64, 0);
          const endRow = parseInt(endMatch[2]);
          
          return { startRow, startCol, endRow, endCol };
        };
        
        const { startRow, startCol, endRow, endCol } = parseRange(range);
        
        for (let row = startRow; row <= endRow; row++) {
          const rowValues: any[] = [];
          for (let col = startCol; col <= endCol; col++) {
            rowValues.push(worksheet.getCell(row, col).value);
          }
          values.push(rowValues);
        }
        
        return {
          success: true,
          range,
          values,
          rowCount: values.length,
          columnCount: values[0]?.length || 0
        };
      }
    });
  }

  private createSetCellRangeTool() {
    return tool({
      description: 'Set values for a range of cells',
      parameters: z.object({
        worksheetName: z.string().describe('Name of the worksheet'),
        range: z.string().describe('Cell range (e.g., A1:C3)'),
        values: z.array(z.array(z.any())).describe('2D array of values to set')
      }),
      execute: async ({ worksheetName, range, values }) => {
        const worksheet = this.getWorksheet(worksheetName);
        const [startCell] = range.split(':');
        
        const parseCell = (cellRef: string) => {
          const match = cellRef.match(/([A-Z]+)(\d+)/);
          if (!match) throw new Error(`Invalid cell: ${cellRef}`);
          const col = match[1].split('').reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 64, 0);
          const row = parseInt(match[2]);
          return { row, col };
        };
        
        const { row: startRow, col: startCol } = parseCell(startCell);
        
        for (let row = 0; row < values.length; row++) {
          for (let col = 0; col < values[row].length; col++) {
            worksheet.getCell(startRow + row, startCol + col).value = values[row][col];
          }
        }
        
        return {
          success: true,
          message: `Set range ${range} with ${values.length} rows and ${values[0]?.length || 0} columns`,
          range,
          rowCount: values.length,
          columnCount: values[0]?.length || 0
        };
      }
    });
  }

  // Row Operations
  private createGetNextEmptyRowTool() {
    return tool({
      description: 'Find the next empty row in a worksheet',
      parameters: z.object({
        worksheetName: z.string().describe('Name of the worksheet'),
        startRow: z.number().optional().describe('Row to start searching from (default: 1)')
      }),
      execute: async ({ worksheetName, startRow = 1 }) => {
        const worksheet = this.getWorksheet(worksheetName);
        
        for (let row = startRow; row <= worksheet.rowCount + 1; row++) {
          const worksheetRow = worksheet.getRow(row);
          if (!worksheetRow.hasValues) {
            return {
              success: true,
              nextEmptyRow: row,
              message: `Next empty row in ${worksheetName}: ${row}`
            };
          }
        }
        
        return {
          success: true,
          nextEmptyRow: worksheet.rowCount + 1,
          message: `Next empty row in ${worksheetName}: ${worksheet.rowCount + 1}`
        };
      }
    });
  }

  private createInsertRowTool() {
    return tool({
      description: 'Insert data into a specific row',
      parameters: z.object({
        worksheetName: z.string().describe('Name of the worksheet'),
        rowNumber: z.number().describe('Row number to insert data'),
        data: z.array(z.any()).describe('Array of values to insert')
      }),
      execute: async ({ worksheetName, rowNumber, data }) => {
        const worksheet = this.getWorksheet(worksheetName);
        const row = worksheet.getRow(rowNumber);
        
        data.forEach((value, index) => {
          row.getCell(index + 1).value = value;
        });
        
        row.commit();
        
        return {
          success: true,
          message: `Inserted data into row ${rowNumber} in ${worksheetName}`,
          rowNumber,
          data
        };
      }
    });
  }

  private createUpdateRowTool() {
    return tool({
      description: 'Update specific cells in a row',
      parameters: z.object({
        worksheetName: z.string().describe('Name of the worksheet'),
        rowNumber: z.number().describe('Row number to update'),
        updates: z.record(z.string(), z.any()).describe('Object with column indexes/names as keys and new values')
      }),
      execute: async ({ worksheetName, rowNumber, updates }) => {
        const worksheet = this.getWorksheet(worksheetName);
        const row = worksheet.getRow(rowNumber);
        
        Object.entries(updates).forEach(([columnRef, value]) => {
          const cell = row.getCell(columnRef);
          cell.value = value;
        });
        
        row.commit();
        
        return {
          success: true,
          message: `Updated row ${rowNumber} in ${worksheetName}`,
          rowNumber,
          updates
        };
      }
    });
  }

  private createDeleteRowTool() {
    return tool({
      description: 'Delete a specific row',
      parameters: z.object({
        worksheetName: z.string().describe('Name of the worksheet'),
        rowNumber: z.number().describe('Row number to delete')
      }),
      execute: async ({ worksheetName, rowNumber }) => {
        const worksheet = this.getWorksheet(worksheetName);
        worksheet.spliceRows(rowNumber, 1);
        
        return {
          success: true,
          message: `Deleted row ${rowNumber} in ${worksheetName}`,
          rowNumber
        };
      }
    });
  }

  private createQueryRowsTool() {
    return tool({
      description: 'Query rows based on column conditions',
      parameters: z.object({
        worksheetName: z.string().describe('Name of the worksheet'),
        columnIndex: z.number().describe('Column index to search in (1-based)'),
        searchValue: z.any().describe('Value to search for'),
        matchType: z.enum(['exact', 'contains', 'startsWith', 'endsWith']).default('exact')
      }),
      execute: async ({ worksheetName, columnIndex, searchValue, matchType = 'exact' }) => {
        const worksheet = this.getWorksheet(worksheetName);
        const matchingRows: any[] = [];
        
        worksheet.eachRow((row: any, rowNumber: number) => {
          const cellValue = row.getCell(columnIndex).value;
          let matches = false;
          
          if (cellValue !== null && cellValue !== undefined) {
            const cellString = cellValue.toString();
            const searchString = searchValue.toString();
            
            switch (matchType) {
              case 'exact':
                matches = cellString === searchString;
                break;
              case 'contains':
                matches = cellString.includes(searchString);
                break;
              case 'startsWith':
                matches = cellString.startsWith(searchString);
                break;
              case 'endsWith':
                matches = cellString.endsWith(searchString);
                break;
            }
          }
          
          if (matches) {
            matchingRows.push({
              rowNumber,
              values: row.values
            });
          }
        });
        
        return {
          success: true,
          matchingRows,
          count: matchingRows.length,
          message: `Found ${matchingRows.length} matching rows in ${worksheetName}`
        };
      }
    });
  }

  // Column Operations
  private createInsertColumnTool() {
    return tool({
      description: 'Insert a new column at specified position',
      parameters: z.object({
        worksheetName: z.string().describe('Name of the worksheet'),
        columnIndex: z.number().describe('Column index to insert at (1-based)'),
        data: z.array(z.any()).optional().describe('Optional array of values for the new column')
      }),
      execute: async ({ worksheetName, columnIndex, data = [] }) => {
        const worksheet = this.getWorksheet(worksheetName);
        worksheet.spliceColumns(columnIndex, 0, data);
        
        return {
          success: true,
          message: `Inserted column at index ${columnIndex} in ${worksheetName}`,
          columnIndex,
          dataLength: data.length
        };
      }
    });
  }

  private createUpdateColumnTool() {
    return tool({
      description: 'Update values in a specific column',
      parameters: z.object({
        worksheetName: z.string().describe('Name of the worksheet'),
        columnIndex: z.number().describe('Column index to update (1-based)'),
        data: z.array(z.any()).describe('Array of values to set in the column'),
        startRow: z.number().optional().describe('Row to start updating from (default: 1)')
      }),
      execute: async ({ worksheetName, columnIndex, data, startRow = 1 }) => {
        const worksheet = this.getWorksheet(worksheetName);
        
        data.forEach((value, index) => {
          const row = worksheet.getRow(startRow + index);
          row.getCell(columnIndex).value = value;
          row.commit();
        });
        
        return {
          success: true,
          message: `Updated column ${columnIndex} in ${worksheetName} with ${data.length} values`,
          columnIndex,
          dataLength: data.length,
          startRow
        };
      }
    });
  }

  private createDeleteColumnTool() {
    return tool({
      description: 'Delete a specific column',
      parameters: z.object({
        worksheetName: z.string().describe('Name of the worksheet'),
        columnIndex: z.number().describe('Column index to delete (1-based)')
      }),
      execute: async ({ worksheetName, columnIndex }) => {
        const worksheet = this.getWorksheet(worksheetName);
        worksheet.spliceColumns(columnIndex, 1);
        
        return {
          success: true,
          message: `Deleted column ${columnIndex} in ${worksheetName}`,
          columnIndex
        };
      }
    });
  }

  // Formatting Operations
  private createFormatCellsTool() {
    return tool({
      description: 'Apply formatting to cells or ranges',
      parameters: z.object({
        worksheetName: z.string().describe('Name of the worksheet'),
        range: z.string().describe('Cell range (e.g., A1:C3)'),
        format: z.object({
          font: z.object({
            name: z.string().optional(),
            size: z.number().optional(),
            bold: z.boolean().optional(),
            italic: z.boolean().optional(),
            color: z.string().optional()
          }).optional(),
          fill: z.object({
            type: z.enum(['pattern', 'gradient']).optional(),
            pattern: z.string().optional(),
            fgColor: z.string().optional(),
            bgColor: z.string().optional()
          }).optional(),
          border: z.object({
            top: z.object({ style: z.string(), color: z.string() }).optional(),
            left: z.object({ style: z.string(), color: z.string() }).optional(),
            bottom: z.object({ style: z.string(), color: z.string() }).optional(),
            right: z.object({ style: z.string(), color: z.string() }).optional()
          }).optional(),
          alignment: z.object({
            horizontal: z.enum(['left', 'center', 'right']).optional(),
            vertical: z.enum(['top', 'middle', 'bottom']).optional(),
            wrapText: z.boolean().optional()
          }).optional(),
          numFmt: z.string().optional()
        })
      }),
      execute: async ({ worksheetName, range, format }) => {
        const worksheet = this.getWorksheet(worksheetName);
        const [, ] = range.split(':');
        
        const parseRange = (range: string) => {
          const [start, end] = range.split(':');
          const startMatch = start.match(/([A-Z]+)(\d+)/);
          const endMatch = end.match(/([A-Z]+)(\d+)/);
          
          if (!startMatch || !endMatch) throw new Error(`Invalid range: ${range}`);
          
          const startCol = startMatch[1].split('').reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 64, 0);
          const startRow = parseInt(startMatch[2]);
          const endCol = endMatch[1].split('').reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 64, 0);
          const endRow = parseInt(endMatch[2]);
          
          return { startRow, startCol, endRow, endCol };
        };
        
        const { startRow, startCol, endRow, endCol } = parseRange(range);
        
        for (let row = startRow; row <= endRow; row++) {
          for (let col = startCol; col <= endCol; col++) {
            const cell = worksheet.getCell(row, col);
            if (format.font) (cell as any).font = { ...(cell as any).font, ...format.font };
            if (format.fill) (cell as any).fill = { ...(cell as any).fill, ...format.fill };
            if (format.border) (cell as any).border = { ...(cell as any).border, ...format.border };
            if (format.alignment) cell.alignment = { ...cell.alignment, ...format.alignment };
            if (format.numFmt) cell.numFmt = format.numFmt;
          }
        }
        
        return {
          success: true,
          message: `Applied formatting to range ${range} in ${worksheetName}`,
          range,
          format
        };
      }
    });
  }

  private createAutoFitColumnsTool() {
    return tool({
      description: 'Auto-fit column widths based on content',
      parameters: z.object({
        worksheetName: z.string().describe('Name of the worksheet'),
        columnIndexes: z.array(z.number()).optional().describe('Specific column indexes to auto-fit (1-based), or all if not specified')
      }),
      execute: async ({ worksheetName, columnIndexes }) => {
        const worksheet = this.getWorksheet(worksheetName);
        
        if (columnIndexes) {
          columnIndexes.forEach(colIndex => {
            const column = worksheet.getColumn(colIndex);
            column.width = undefined; // This triggers auto-fit
          });
        } else {
          // Auto-fit all columns
          worksheet.columns.forEach(column => {
            column.width = undefined;
          });
        }
        
        return {
          success: true,
          message: `Auto-fitted columns in ${worksheetName}`,
          columnIndexes: columnIndexes || 'all'
        };
      }
    });
  }

  // Data Operations
  private createFindAndReplaceTool() {
    return tool({
      description: 'Find and replace values in the worksheet',
      parameters: z.object({
        worksheetName: z.string().describe('Name of the worksheet'),
        findValue: z.any().describe('Value to find'),
        replaceValue: z.any().describe('Value to replace with'),
        matchCase: z.boolean().optional().default(false),
        matchEntireCell: z.boolean().optional().default(false)
      }),
      execute: async ({ worksheetName, findValue, replaceValue, matchCase = false, matchEntireCell = false }) => {
        const worksheet = this.getWorksheet(worksheetName);
        let replacementCount = 0;
        
        worksheet.eachRow((row: any, _rowNumber: number) => {
          row.eachCell((cell: any, _colNumber: number) => {
            let cellValue = cell.value;
            if (cellValue !== null && cellValue !== undefined) {
              let cellString = cellValue.toString();
              let findString = findValue.toString();
              
              if (!matchCase) {
                cellString = cellString.toLowerCase();
                findString = findString.toLowerCase();
              }
              
              if (matchEntireCell) {
                if (cellString === findString) {
                  cell.value = replaceValue;
                  replacementCount++;
                }
              } else {
                if (cellString.includes(findString)) {
                  cell.value = cellValue.toString().replace(
                    new RegExp(findValue.toString(), matchCase ? 'g' : 'gi'),
                    replaceValue.toString()
                  );
                  replacementCount++;
                }
              }
            }
          });
        });
        
        return {
          success: true,
          message: `Replaced ${replacementCount} occurrences of '${findValue}' with '${replaceValue}' in ${worksheetName}`,
          replacementCount,
          findValue,
          replaceValue
        };
      }
    });
  }

  private createSortDataTool() {
    return tool({
      description: 'Sort data in a range by specified columns',
      parameters: z.object({
        worksheetName: z.string().describe('Name of the worksheet'),
        range: z.string().describe('Range to sort (e.g., A1:D10)'),
        sortColumns: z.array(z.object({
          column: z.number().describe('Column index to sort by (1-based)'),
          descending: z.boolean().optional().default(false)
        })).describe('Array of sort criteria')
      }),
      execute: async ({ worksheetName, range, sortColumns }) => {
        const worksheet = this.getWorksheet(worksheetName);
        const [, ] = range.split(':');
        
        const parseRange = (range: string) => {
          const [start, end] = range.split(':');
          const startMatch = start.match(/([A-Z]+)(\d+)/);
          const endMatch = end.match(/([A-Z]+)(\d+)/);
          
          if (!startMatch || !endMatch) throw new Error(`Invalid range: ${range}`);
          
          const startCol = startMatch[1].split('').reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 64, 0);
          const startRow = parseInt(startMatch[2]);
          const endCol = endMatch[1].split('').reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 64, 0);
          const endRow = parseInt(endMatch[2]);
          
          return { startRow, startCol, endRow, endCol };
        };
        
        const { startRow, startCol, endRow, endCol } = parseRange(range);
        
        // Get all data from the range
        const data: any[][] = [];
        for (let row = startRow; row <= endRow; row++) {
          const rowValues: any[] = [];
          for (let col = startCol; col <= endCol; col++) {
            rowValues.push(worksheet.getCell(row, col).value);
          }
          data.push(rowValues);
        }
        
        // Sort the data
        data.sort((a, b) => {
          for (const sortCol of sortColumns) {
            const aVal = a[sortCol.column - 1];
            const bVal = b[sortCol.column - 1];
            
            let comparison = 0;
            if (aVal < bVal) comparison = -1;
            else if (aVal > bVal) comparison = 1;
            
            if (sortCol.descending) comparison *= -1;
            
            if (comparison !== 0) return comparison;
          }
          return 0;
        });
        
        // Write sorted data back to the range
        for (let row = 0; row < data.length; row++) {
          for (let col = 0; col < data[row].length; col++) {
            worksheet.getCell(startRow + row, startCol + col).value = data[row][col];
          }
        }
        
        return {
          success: true,
          message: `Sorted data in range ${range} of ${worksheetName}`,
          range,
          sortColumns,
          rowCount: data.length
        };
      }
    });
  }

  private createFilterDataTool() {
    return tool({
      description: 'Apply filters to data range',
      parameters: z.object({
        worksheetName: z.string().describe('Name of the worksheet'),
        range: z.string().describe('Range to filter (e.g., A1:D10)'),
        filters: z.array(z.object({
          column: z.number().describe('Column index to filter by (1-based)'),
          operator: z.enum(['equals', 'contains', 'startsWith', 'endsWith', 'greaterThan', 'lessThan']),
          value: z.any().describe('Value to filter by')
        })).describe('Array of filter criteria')
      }),
      execute: async ({ worksheetName, range, filters }) => {
        const worksheet = this.getWorksheet(worksheetName);
        const [, ] = range.split(':');
        
        const parseRange = (range: string) => {
          const [start, end] = range.split(':');
          const startMatch = start.match(/([A-Z]+)(\d+)/);
          const endMatch = end.match(/([A-Z]+)(\d+)/);
          
          if (!startMatch || !endMatch) throw new Error(`Invalid range: ${range}`);
          
          const startCol = startMatch[1].split('').reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 64, 0);
          const startRow = parseInt(startMatch[2]);
          const endCol = endMatch[1].split('').reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 64, 0);
          const endRow = parseInt(endMatch[2]);
          
          return { startRow, startCol, endRow, endCol };
        };
        
        const { startRow, startCol, endRow, endCol } = parseRange(range);
        
        // Get all data from the range
        const allData: any[][] = [];
        for (let row = startRow; row <= endRow; row++) {
          const rowValues: any[] = [];
          for (let col = startCol; col <= endCol; col++) {
            rowValues.push(worksheet.getCell(row, col).value);
          }
          allData.push(rowValues);
        }
        
        // Filter the data
        const filteredData = allData.filter(row => {
          return filters.every(filter => {
            const cellValue = row[filter.column - 1];
            if (cellValue === null || cellValue === undefined) return false;
            
            const cellString = cellValue.toString();
            const filterString = filter.value.toString();
            
            switch (filter.operator) {
              case 'equals':
                return cellString === filterString;
              case 'contains':
                return cellString.includes(filterString);
              case 'startsWith':
                return cellString.startsWith(filterString);
              case 'endsWith':
                return cellString.endsWith(filterString);
              case 'greaterThan':
                return parseFloat(cellString) > parseFloat(filterString);
              case 'lessThan':
                return parseFloat(cellString) < parseFloat(filterString);
              default:
                return true;
            }
          });
        });
        
        return {
          success: true,
          message: `Filtered data in range ${range} of ${worksheetName}`,
          range,
          filters,
          originalRowCount: allData.length,
          filteredRowCount: filteredData.length,
          filteredData
        };
      }
    });
  }

  private getWorksheet(worksheetName: string): ExcelJS.Worksheet {
    if (!this.workbook) {
      throw new Error('No workbook loaded. Please load a workbook first.');
    }
    
    if (this.worksheetCache.has(worksheetName)) {
      return this.worksheetCache.get(worksheetName)!;
    }
    
    const worksheet = this.workbook.getWorksheet(worksheetName);
    if (!worksheet) {
      throw new Error(`Worksheet '${worksheetName}' not found`);
    }
    
    this.worksheetCache.set(worksheetName, worksheet);
    return worksheet;
  }
}