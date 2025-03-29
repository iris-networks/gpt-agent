import * as ExcelJS from 'exceljs';

/**
 * Updates data in an Excel file
 * 
 * @param filePath Path to the Excel file
 * @param data Data to update in the Excel file
 * @param sheetName Name of the sheet to update
 * @param range Cell range to update (e.g., "A1:C5")
 * @param options Additional options for the operation
 * @returns Object with update status
 */
export async function updateExcel(
  filePath: string,
  data: any[] | Record<string, any>[],
  sheetName?: string,
  range?: string,
  options?: Record<string, any>
): Promise<{ success: boolean; message: string }> {
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

    if (range) {
      // Update specific range
      const [startCell, endCell] = range.split(':');
      
      if (!endCell) {
        // Single cell update
        const cell = sheet.getCell(startCell);
        if (Array.isArray(data) && data.length > 0) {
          cell.value = data[0];
        } else {
          cell.value = data;
        }
      } else {
        // Range update
        const startAddress = sheet.getCell(startCell).address;
        const endAddress = sheet.getCell(endCell).address;

        if (Array.isArray(data)) {
          let rowIndex = 0;
          for (let row = startAddress.row; row <= endAddress.row && rowIndex < data.length; row++) {
            const rowData = data[rowIndex];
            
            if (Array.isArray(rowData)) {
              let colIndex = 0;
              for (let col = startAddress.col; col <= endAddress.col && colIndex < rowData.length; col++) {
                sheet.getCell(row, col).value = rowData[colIndex];
                colIndex++;
              }
            }
            
            rowIndex++;
          }
        }
      }
    } else {
      // Replace entire sheet data
      sheet.clearRows();
      
      if (Array.isArray(data) && data.length > 0) {
        if (Array.isArray(data[0])) {
          // Data is array of arrays
          sheet.addRows(data);
        } else {
          // Data is array of objects
          const headers = Object.keys(data[0]);
          sheet.addRow(headers);
          
          data.forEach(item => {
            sheet.addRow(Object.values(item));
          });
        }
      }
    }

    // Save the workbook
    await workbook.xlsx.writeFile(filePath);

    return {
      success: true,
      message: `Excel file updated successfully at ${filePath}`
    };
  } catch (error) {
    throw error;
  }
}