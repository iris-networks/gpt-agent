import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';
import { homedir } from 'os';
import { getHeaders, compareValues } from './utils';

/**
 * Helper function to get file path from excelId
 * @param excelId The ID of the Excel file
 * @returns The full file path or null if not found
 */
function getFilePathFromId(excelId: string): string | null {
  const filesDir = path.join(homedir(), '.iris', 'files');
  const metadataPath = path.join(filesDir, `${excelId}.json`);

  if (!fs.existsSync(metadataPath)) {
    return null;
  }

  try {
    const rawData = fs.readFileSync(metadataPath, 'utf8');
    const metadata = JSON.parse(rawData);

    if (fs.existsSync(metadata.filePath)) {
      return metadata.filePath;
    }
    return null;
  } catch (error) {
    console.error(`Error reading metadata for excelId ${excelId}:`, error);
    return null;
  }
}

/**
 * Describes an Excel file structure, including sheets, headers, and sample data
 * @param excelIdOrPath Excel ID or direct file path
 * @param sampleRows Number of sample rows to include per sheet
 * @returns Description of the Excel file
 */
export async function describeExcelFile(
  excelIdOrPath: string,
  sampleRows: number = 3
): Promise<{
  success: boolean;
  data: {
    fileName: string;
    sheets: Array<{
      name: string;
      rowCount: number;
      columnCount: number;
      headers: string[];
      sampleData: Record<string, any>[];
    }>;
  } | null;
  error: string | null;
}> {
  try {
    // Check if the input is an Excel ID and get the file path if it is
    const filePath = getFilePathFromId(excelIdOrPath) || excelIdOrPath;

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return {
        success: false,
        error: `Excel file not found: ${excelIdOrPath}`,
        data: null
      };
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const fileName = filePath.split('/').pop() || '';
    const sheets = [];

    for (const worksheet of workbook.worksheets) {
      const headers = getHeaders(worksheet);
      const sampleData: Record<string, any>[] = [];

      // Get sample rows (starting from row 2, skipping headers)
      let rowsProcessed = 0;
      worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header row
        if (rowsProcessed >= sampleRows) return; // Limit to sample size

        const rowData: Record<string, any> = {
          rowId: rowNumber // Include rowId in the sample data
        };
        headers.forEach((header, index) => {
          rowData[header] = row.getCell(index + 1).value;
        });

        sampleData.push(rowData);
        rowsProcessed++;
      });

      sheets.push({
        name: worksheet.name,
        rowCount: worksheet.rowCount,
        columnCount: worksheet.columnCount,
        headers,
        sampleData
      });
    }

    return {
      success: true,
      data: {
        fileName,
        sheets
      },
      error: null
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to describe Excel file: ${error.message}`,
      data: null
    };
  }
}

/**
 * Read a row by index
 * @param excelIdOrPath Excel ID or direct file path
 * @param rowIndex Index of the row to read (1-based)
 * @param sheetName Optional sheet name
 * @returns Row data or error
 */
export async function readRowByIndex(
  excelIdOrPath: string,
  rowIndex: number,
  sheetName?: string
): Promise<{ success: boolean; data: Record<string, any> | null; error: string | null }> {
  try {
    // Check if the input is an Excel ID and get the file path if it is
    const filePath = getFilePathFromId(excelIdOrPath) || excelIdOrPath;

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return {
        success: false,
        error: `Excel file not found: ${excelIdOrPath}`,
        data: null
      };
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet = sheetName
      ? workbook.getWorksheet(sheetName)
      : workbook.worksheets[0];

    if (!worksheet) {
      return {
        success: false,
        error: `Worksheet ${sheetName || 'at index 0'} not found`,
        data: null
      };
    }
    
    const headers = getHeaders(worksheet);
    const row = worksheet.getRow(rowIndex);
    
    if (!row.hasValues) {
      return {
        success: false,
        error: `Row at index ${rowIndex} is empty or doesn't exist`,
        data: null
      };
    }
    
    const rowData: Record<string, any> = {
      rowId: rowIndex // Include rowId in the returned data
    };
    headers.forEach((header, index) => {
      rowData[header] = row.getCell(index + 1).value;
    });

    return {
      success: true,
      data: rowData,
      error: null
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to read row ${rowIndex}: ${error.message}`,
      data: null
    };
  }
}

/**
 * Query rows by criteria
 * @param excelIdOrPath Excel ID or direct file path
 * @param query Query criteria
 * @param sheetName Optional sheet name
 * @returns Matching rows or error
 */
export async function queryRows(
  excelIdOrPath: string,
  query: Record<string, any>,
  sheetName?: string
): Promise<{ success: boolean; data: Record<string, any>[] | null; error: string | null }> {
  try {
    // Check if the input is an Excel ID and get the file path if it is
    const filePath = getFilePathFromId(excelIdOrPath) || excelIdOrPath;

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return {
        success: false,
        error: `Excel file not found: ${excelIdOrPath}`,
        data: null
      };
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet = sheetName
      ? workbook.getWorksheet(sheetName)
      : workbook.worksheets[0];

    if (!worksheet) {
      return {
        success: false,
        error: `Worksheet ${sheetName || 'at index 0'} not found`,
        data: null
      };
    }
    
    const headers = getHeaders(worksheet);
    const queryColumns = Object.keys(query);
    
    // Validate query columns against headers
    for (const column of queryColumns) {
      if (!headers.includes(column)) {
        return {
          success: false,
          error: `Query column "${column}" not found in worksheet headers`,
          data: null
        };
      }
    }
    
    const columnIndexes = queryColumns.map(column => headers.indexOf(column) + 1);
    const matchingRows: Record<string, any>[] = [];
    
    // Start from row 2 to skip headers
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row
      
      let isMatch = true;
      for (let i = 0; i < queryColumns.length; i++) {
        const column = queryColumns[i];
        const columnIndex = columnIndexes[i];
        const cellValue = row.getCell(columnIndex).value;
        
        // Use compareValues for case-insensitive and loose equality comparison
        if (!compareValues(cellValue, query[column])) {
          isMatch = false;
          break;
        }
      }
      
      if (isMatch) {
        const rowData: Record<string, any> = {
          rowId: rowNumber // Include rowId in the returned data
        };
        headers.forEach((header, index) => {
          rowData[header] = row.getCell(index + 1).value;
        });
        matchingRows.push(rowData);
      }
    });
    
    return {
      success: true,
      data: matchingRows,
      error: null
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to query rows: ${error.message}`,
      data: null
    };
  }
}

/**
 * Write data to a specific row
 * @param excelIdOrPath Excel ID or direct file path
 * @param rowIndex Index of the row to write to (1-based)
 * @param data Data to write
 * @param sheetName Optional sheet name
 * @returns Success status or error
 */
export async function writeRowByIndex(
  excelIdOrPath: string,
  rowIndex: number,
  data: Record<string, any>,
  sheetName?: string
): Promise<{ success: boolean; rowsUpdated: number; error: string | null }> {
  try {
    // Check if the input is an Excel ID and get the file path if it is
    const filePath = getFilePathFromId(excelIdOrPath) || excelIdOrPath;

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return {
        success: false,
        error: `Excel file not found: ${excelIdOrPath}`,
        rowsUpdated: 0
      };
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet = sheetName
      ? workbook.getWorksheet(sheetName)
      : workbook.worksheets[0];

    if (!worksheet) {
      return {
        success: false,
        error: `Worksheet ${sheetName || 'at index 0'} not found`,
        rowsUpdated: 0
      };
    }
    
    const headers = getHeaders(worksheet);
    const row = worksheet.getRow(rowIndex);
    
    // Write data to cells
    for (const [key, value] of Object.entries(data)) {
      const columnIndex = headers.indexOf(key) + 1;
      if (columnIndex === 0) {
        console.warn(`Column "${key}" not found in headers, skipping`);
        continue;
      }
      row.getCell(columnIndex).value = value;
    }
    
    // Commit the row
    row.commit();
    
    // Save the workbook
    await workbook.xlsx.writeFile(filePath);
    
    return {
      success: true,
      rowsUpdated: 1,
      error: null
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to write to row ${rowIndex}: ${error.message}`,
      rowsUpdated: 0
    };
  }
}

/**
 * Update rows matching a query
 * @param excelIdOrPath Excel ID or direct file path
 * @param query Query criteria
 * @param data Data to update
 * @param sheetName Optional sheet name
 * @returns Number of rows updated or error
 */
export async function updateRowsByQuery(
  excelIdOrPath: string,
  query: Record<string, any>,
  data: Record<string, any>,
  sheetName?: string
): Promise<{ success: boolean; rowsUpdated: number; error: string | null }> {
  try {
    // Check if the input is an Excel ID and get the file path if it is
    const filePath = getFilePathFromId(excelIdOrPath) || excelIdOrPath;

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return {
        success: false,
        error: `Excel file not found: ${excelIdOrPath}`,
        rowsUpdated: 0
      };
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet = sheetName
      ? workbook.getWorksheet(sheetName)
      : workbook.worksheets[0];

    if (!worksheet) {
      return {
        success: false,
        error: `Worksheet ${sheetName || 'at index 0'} not found`,
        rowsUpdated: 0
      };
    }
    
    const headers = getHeaders(worksheet);
    const queryColumns = Object.keys(query);
    const dataColumns = Object.keys(data);
    
    // Validate query and data columns against headers
    for (const column of [...queryColumns, ...dataColumns]) {
      if (!headers.includes(column)) {
        return {
          success: false,
          error: `Column "${column}" not found in worksheet headers`,
          rowsUpdated: 0
        };
      }
    }
    
    const queryColumnIndexes = queryColumns.map(column => headers.indexOf(column) + 1);
    const dataColumnIndexes = dataColumns.map(column => headers.indexOf(column) + 1);
    let updatedCount = 0;
    
    // Start from row 2 to skip headers
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row
      
      let isMatch = true;
      for (let i = 0; i < queryColumns.length; i++) {
        const column = queryColumns[i];
        const columnIndex = queryColumnIndexes[i];
        const cellValue = row.getCell(columnIndex).value;
        
        // Use compareValues for case-insensitive and loose equality comparison
        if (!compareValues(cellValue, query[column])) {
          isMatch = false;
          break;
        }
      }
      
      if (isMatch) {
        // Update data columns
        for (let i = 0; i < dataColumns.length; i++) {
          const column = dataColumns[i];
          const columnIndex = dataColumnIndexes[i];
          row.getCell(columnIndex).value = data[column];
        }
        
        // Commit the row
        row.commit();
        updatedCount++;
      }
    });
    
    // Save the workbook if any rows were updated
    if (updatedCount > 0) {
      await workbook.xlsx.writeFile(filePath);
    }
    
    return {
      success: true,
      rowsUpdated: updatedCount,
      error: null
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to update rows: ${error.message}`,
      rowsUpdated: 0
    };
  }
}