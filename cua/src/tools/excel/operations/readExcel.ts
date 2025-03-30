import * as ExcelJS from 'exceljs';

/**
 * Reads data from an Excel file
 * 
 * @param filePath Path to the Excel file
 * @param sheetName Name of the sheet to read (defaults to first sheet)
 * @param range Cell range to read (e.g., "A1:C5")
 * @param options Additional options for the operation
 * @returns Object with the read data
 */
export async function readExcel(
  filePath: string,
  sheetName?: string,
  range?: string,
  options?: Record<string, any>
): Promise<{ data: any[]; sheetName: string }> {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    // Get the specified sheet or the first sheet
    const sheet = sheetName 
      ? workbook.getWorksheet(sheetName) 
      : workbook.worksheets[0];
    
    if (!sheet) {
      throw new Error(`Sheet ${sheetName || 'at index 0'} not found`);
    }

    const result: any[] = [];

    // Parse range if provided
    if (range) {
      const rangeData = sheet.getRows(1, sheet.rowCount) || [];
      const cells = sheet.getCell(range);
      
      // Handle range
      if (cells) {
        // Implementation depends on exact needs
        // For now, return a simplified version
        sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
          const rowData: Record<string, any> = {};
          row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
            rowData[`col${colNumber}`] = cell.value;
          });
          result.push(rowData);
        });
      }
    } else {
      // Read entire sheet
      const hasHeader = options?.headerRow === true;
      let headers: string[] = [];

      sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (hasHeader && rowNumber === 1) {
          // Get headers from first row
          headers = row.values.slice(1) as string[];
          return;
        }

        if (hasHeader) {
          const rowData: Record<string, any> = {};
          row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
            rowData[headers[colNumber - 1] || `col${colNumber}`] = cell.value;
          });
          result.push(rowData);
        } else {
          const rowData: any[] = [];
          row.eachCell({ includeEmpty: false }, (cell) => {
            rowData.push(cell.value);
          });
          result.push(rowData);
        }
      });
    }

    return {
      data: result,
      sheetName: sheet.name
    };
  } catch (error) {
    throw error;
  }
}