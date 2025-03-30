import * as ExcelJS from 'exceljs';
import * as fs from 'fs';

/**
 * Deletes an Excel file, sheet, or range
 * 
 * @param filePath Path to the Excel file
 * @param sheetName Name of the sheet to delete
 * @param range Cell range to clear (e.g., "A1:C5")
 * @param options Additional options for the operation
 * @returns Object with deletion status
 */
export async function deleteExcel(
  filePath: string,
  sheetName?: string,
  range?: string,
  options?: Record<string, any>
): Promise<{ success: boolean; message: string }> {
  try {
    // If no sheet and no range, delete the entire file
    if (!sheetName && !range) {
      if (options?.deleteFile === true) {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          return {
            success: true,
            message: `Excel file deleted successfully: ${filePath}`
          };
        } else {
          throw new Error(`File not found: ${filePath}`);
        }
      }
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    if (sheetName && !range) {
      // Delete entire sheet
      const sheetIndex = workbook.worksheets.findIndex(sheet => sheet.name === sheetName);
      
      if (sheetIndex === -1) {
        throw new Error(`Sheet "${sheetName}" not found`);
      }
      
      workbook.removeWorksheet(sheetIndex);
      await workbook.xlsx.writeFile(filePath);
      
      return {
        success: true,
        message: `Sheet "${sheetName}" deleted successfully`
      };
    } else {
      // Get the specified sheet or the first sheet
      const sheet = sheetName 
        ? workbook.getWorksheet(sheetName) 
        : workbook.worksheets[0];
      
      if (!sheet) {
        throw new Error(`Sheet ${sheetName || 'at index 0'} not found`);
      }

      if (range) {
        // Clear range
        const [startCell, endCell] = range.split(':');
        
        if (!endCell) {
          // Single cell clear
          sheet.getCell(startCell).value = null;
        } else {
          // Range clear
          const startAddress = sheet.getCell(startCell).address;
          const endAddress = sheet.getCell(endCell).address;

          for (let row = startAddress.row; row <= endAddress.row; row++) {
            for (let col = startAddress.col; col <= endAddress.col; col++) {
              sheet.getCell(row, col).value = null;
            }
          }
        }
      }

      await workbook.xlsx.writeFile(filePath);
      
      return {
        success: true,
        message: range 
          ? `Range "${range}" cleared successfully` 
          : `Excel file updated successfully`
      };
    }
  } catch (error) {
    throw error;
  }
}