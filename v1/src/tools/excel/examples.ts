import { ExcelTool } from './excelTool';
import * as path from 'path';


const sampleData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', active: true },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', active: false },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', active: true },
];

// File path for examples
const exampleFilePath = path.resolve('/Users/shanurrahman/Documents/spc/qwen/zenobia/v1/src/tools/excel/examples', 'example.xlsx');


ExcelTool.run({
  action: "create",
  filePath: exampleFilePath,
  sheetName: 'Sheet1',
  "data": sampleData,
}).then(() => {
  console.log("Excel file created successfully.");
}).catch((error) => {
  console.error("Error creating Excel file:", error);
});