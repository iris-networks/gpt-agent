import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Creates a new Excel file with the provided data
 * 
 * @param filePath Path where the Excel file should be created
 * @param data Data to write to the Excel file
 * @param sheetName Name of the sheet (defaults to 'Sheet1')
 * @param options Additional options for the operation
 * @returns Object with status and message
 */
export async function createExcel(
  filePath: string, 
  data: any[] | Record<string, any>[], 
  sheetName: string = 'Sheet1',
  options?: Record<string, any>
): Promise<{ success: boolean; message: string; filePath: string }> {
  try {
    // Create directory if it doesn't exist
    const directory = path.dirname(filePath);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    // Check if file already exists
    if (fs.existsSync(filePath)) {
      throw new Error(`File already exists at ${filePath}`);
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    // Handle different data formats
    if (Array.isArray(data)) {
      if (data.length > 0) {
        if (Array.isArray(data[0])) {
          // Data is array of arrays
          worksheet.addRows(data);
        } else {
          // Data is array of objects
          // Extract column headers from the first object
          const headers = Object.keys(data[0]);
          worksheet.addRow(headers);
          
          // Add data rows
          data.forEach(item => {
            worksheet.addRow(Object.values(item));
          });
        }
      }
    }

    // Apply optional formatting
    if (options?.headerRow) {
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
    }

    // Save the workbook
    await workbook.xlsx.writeFile(filePath);

    return {
      success: true,
      message: `Excel file created successfully at ${filePath}`,
      filePath
    };
  } catch (error) {
    throw error;
  }
}