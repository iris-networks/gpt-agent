# Excel Tool Documentation

The Excel Tool provides a simple interface for interacting with Excel files (`.xlsx` and `.xls`) in your application. It supports exploring Excel file structure, reading specific rows, querying data based on criteria, writing data to specific rows, and updating data across multiple rows.

## Installation

The Excel Tool is built on top of the [ExcelJS](https://github.com/exceljs/exceljs) library, which needs to be installed as a dependency:

```bash
pnpm add exceljs
```

## Basic Usage

The Excel Tool provides a unified interface for different Excel operations through a single `execute` method. Here's how to use it:

```typescript
import { excelTool } from '../tools/excelTool';

// Example: Describe an Excel file structure
const result = await excelTool.execute({
  operation: 'describe',
  filePath: './data/employees.xlsx'
});

if (result.success) {
  console.log('Excel structure:', result.data);
} else {
  console.error('Error:', result.error);
}
```

## Operations

The tool supports five main operations:

### 1. Describe Operation

Gets the structure of an Excel file including sheet information, headers, and sample data.

```typescript
const result = await excelTool.execute({
  operation: 'describe',
  filePath: './data/employees.xlsx',
  sampleRows: 3           // Optional: Number of sample rows to include (defaults to 3, max 10)
});

// Result contains:
// {
//   success: true,
//   data: {
//     fileName: 'employees.xlsx',
//     sheets: [
//       {
//         name: 'Sheet1',
//         rowCount: 15,
//         columnCount: 6,
//         headers: ['Name', 'Age', 'Department', 'Status', 'StartDate', 'Salary'],
//         sampleData: [
//           { Name: 'John Doe', Age: 30, Department: 'Engineering', ... },
//           { Name: 'Jane Smith', Age: 28, Department: 'Marketing', ... },
//           { Name: 'Bob Johnson', Age: 35, Department: 'Finance', ... }
//         ]
//       },
//       {
//         name: 'Sheet2',
//         ...
//       }
//     ]
//   },
//   error: null
// }
```

This operation is particularly useful for:
- Understanding the structure of an Excel file you're not familiar with
- Previewing the data before operations
- Discovering available sheets and column headers
- Getting a quick overview of the data

### 2. Read Operation

Reads data from a specific row in an Excel file.

```typescript
const result = await excelTool.execute({
  operation: 'read',
  filePath: './data/employees.xlsx',
  rowIndex: 3,           // Required: 1-based index of the row to read
  sheetName: 'Sheet1'    // Optional: Defaults to first sheet
});

// Result contains:
// { 
//   success: true, 
//   data: { Name: 'John Doe', Age: 30, Department: 'Engineering' },
//   error: null 
// }
```

### 3. Query Operation

Finds rows that match specific criteria. Queries are case-insensitive for string values and use loose equality (==) for all other types.

```typescript
const result = await excelTool.execute({
  operation: 'query',
  filePath: './data/employees.xlsx',
  query: {                // Required: Object with column names and values to match
    Department: 'engineering',  // Case-insensitive (will match 'Engineering', 'ENGINEERING', etc.)
    Status: 'Active'
  },
  sheetName: 'Sheet1'     // Optional: Defaults to first sheet
});

// Result contains:
// { 
//   success: true, 
//   data: [
//     { Name: 'John Doe', Age: 30, Department: 'Engineering', Status: 'Active', _rowIndex: 3 },
//     { Name: 'Jane Smith', Age: 28, Department: 'Engineering', Status: 'Active', _rowIndex: 5 }
//   ],
//   error: null 
// }
```

Note: 
- Query results include the `_rowIndex` property, which provides the 1-based row index that can be used for subsequent write operations.
- String comparisons are case-insensitive (e.g., 'engineering' will match 'Engineering' or 'ENGINEERING')
- Number and boolean comparisons use loose equality, so '30' will match 30

### 4. Write Operation

Writes data to a specific row.

```typescript
const result = await excelTool.execute({
  operation: 'write',
  filePath: './data/employees.xlsx',
  rowIndex: 3,           // Required: 1-based index of the row to write to
  data: {                // Required: Object with column names and values to write
    Name: 'John Smith',
    Age: 31,
    Department: 'Engineering',
    Status: 'On Leave'
  },
  sheetName: 'Sheet1'    // Optional: Defaults to first sheet
});

// Result contains:
// { 
//   success: true, 
//   rowsUpdated: 1,
//   error: null 
// }
```

### 5. Update Operation

Updates multiple rows that match specific criteria. Like queries, the matching is case-insensitive for strings and uses loose equality (==) for other value types.

```typescript
const result = await excelTool.execute({
  operation: 'update',
  filePath: './data/employees.xlsx',
  query: {                // Required: Object with column names and values to match
    Department: 'engineering'  // Case-insensitive (will match any case)
  },
  data: {                 // Required: Object with column names and values to update
    Status: 'Remote',
    LastUpdated: '2024-05-14'
  },
  sheetName: 'Sheet1'     // Optional: Defaults to first sheet
});

// Result contains:
// { 
//   success: true, 
//   rowsUpdated: 5, // Number of rows that were updated
//   error: null 
// }
```

## Parameters

The tool accepts the following parameters:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `operation` | `'describe' \| 'read' \| 'query' \| 'write' \| 'update'` | Yes | The operation to perform |
| `filePath` | `string` | Yes | Path to the Excel file (must end with .xlsx or .xls) |
| `rowIndex` | `number` | For 'read' and 'write' | 1-based index of the row to read or write |
| `query` | `Record<string, string \| number \| boolean \| null>` | For 'query' and 'update' | Object with column names and values to match (case-insensitive for strings) |
| `data` | `Record<string, string \| number \| boolean \| null>` | For 'write' and 'update' | Object with column names and values to write |
| `sheetName` | `string` | No | Name of the worksheet to operate on (defaults to first sheet if not provided) |
| `sampleRows` | `number` | No | Number of sample rows to include in describe operation (defaults to 3, max 10) |

## Return Values

All operations return a result object with the following structure:

### For describe operation:
```typescript
{
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
}
```

### For read operation:
```typescript
{
  success: boolean;
  data: Record<string, any> | null; // Row data as object with column names as keys
  error: string | null;
}
```

### For query operation:
```typescript
{
  success: boolean;
  data: Record<string, any>[] | null; // Array of matching rows
  error: string | null;
}
```

### For write and update operations:
```typescript
{
  success: boolean;
  rowsUpdated: number; // Number of rows updated
  error: string | null;
}
```

## Error Handling

The tool provides detailed error messages for various scenarios:

```typescript
try {
  const result = await excelTool.execute({
    operation: 'read',
    filePath: './non-existent-file.xlsx',
    rowIndex: 3
  });
  
  if (!result.success) {
    console.error('Operation failed:', result.error);
  }
} catch (error) {
  console.error('Unexpected error:', error);
}
```

Common errors include:
- File not found
- Invalid sheet name
- Row index out of bounds
- Column not found in headers
- Invalid parameter types

## Matching Logic

The tool uses the following matching logic when comparing values:

1. **String values**: Case-insensitive comparison (e.g., 'engineering' will match 'Engineering', 'ENGINEERING', etc.)
2. **Other value types**: Loose equality (==) comparison, which means:
   - `1` will match `'1'` (number equals string)
   - `true` will match `'true'` or `1` 
   - `null` will match `undefined`

This makes query operations more flexible and practical for real-world data.

## Complete Example

Here's a complete example showing how to use all operations:

```typescript
import { excelTool } from '../tools/excelTool';

async function manageEmployeeData() {
  try {
    // 1. First, get an overview of the Excel file structure
    const fileStructure = await excelTool.execute({
      operation: 'describe',
      filePath: './data/employees.xlsx',
      sampleRows: 2
    });
    
    console.log(`File contains ${fileStructure.data.sheets.length} sheets`);
    console.log(`Headers in first sheet: ${fileStructure.data.sheets[0].headers.join(', ')}`);
    console.log(`Sample data from first sheet:`, fileStructure.data.sheets[0].sampleData);
    
    // 2. Read the header row to understand the structure
    const headerRow = await excelTool.execute({
      operation: 'read',
      filePath: './data/employees.xlsx',
      rowIndex: 1
    });
    console.log('Excel headers:', headerRow.data);
    
    // 3. Query for all Engineering employees (case-insensitive)
    const engineers = await excelTool.execute({
      operation: 'query',
      filePath: './data/employees.xlsx',
      query: { Department: 'engineering' }  // Will match 'Engineering' regardless of case
    });
    console.log(`Found ${engineers.data.length} engineers`);
    
    // 4. Update all engineers to 'Remote' status
    const updateResult = await excelTool.execute({
      operation: 'update',
      filePath: './data/employees.xlsx',
      query: { Department: 'engineering' },
      data: { Status: 'Remote', LastUpdated: new Date().toISOString() }
    });
    console.log(`Updated ${updateResult.rowsUpdated} employees to Remote status`);
    
    // 5. Add a new employee at row 10
    const addResult = await excelTool.execute({
      operation: 'write',
      filePath: './data/employees.xlsx',
      rowIndex: 10,
      data: {
        Name: 'New Employee',
        Age: 25,
        Department: 'Marketing',
        Status: 'Active',
        StartDate: new Date().toISOString()
      }
    });
    console.log('Added new employee:', addResult.success);
    
  } catch (error) {
    console.error('Error in employee data management:', error);
  }
}

manageEmployeeData();
```

## Practical Use Cases

### Understanding a New Excel File

When working with an unfamiliar Excel file, you can use the describe operation to understand its contents:

```typescript
const fileInfo = await excelTool.execute({
  operation: 'describe',
  filePath: './data/unknown_file.xlsx',
  sampleRows: 5
});

// Now you can see all sheets, their columns, and sample data
console.log(`The file contains ${fileInfo.data.sheets.length} sheets:`);
fileInfo.data.sheets.forEach(sheet => {
  console.log(`- ${sheet.name}: ${sheet.headers.join(', ')}`);
  console.log(`  ${sheet.rowCount} rows x ${sheet.columnCount} columns`);
  console.log(`  Sample data:`, sheet.sampleData[0]);
});
```

### Working with Multiple Sheets

You can specify which sheet to work with using the `sheetName` parameter:

```typescript
// Read from a specific sheet
const salesData = await excelTool.execute({
  operation: 'read',
  filePath: './data/company.xlsx',
  rowIndex: 5,
  sheetName: 'Sales2023'
});

// Update data in a specific sheet
const updateMarketingData = await excelTool.execute({
  operation: 'update',
  filePath: './data/company.xlsx',
  query: { Quarter: 'q2' },  // Case-insensitive - will match 'Q2' 
  data: { Status: 'Finalized' },
  sheetName: 'Marketing2023'
});
```

### Running Sequential Operations

For more complex workflows, you can chain operations together:

```typescript
async function promoteEngineers() {
  // First, find all senior engineers (case-insensitive)
  const seniorEngineers = await excelTool.execute({
    operation: 'query',
    filePath: './data/employees.xlsx',
    query: { 
      Department: 'engineering',  // Will match any case
      Level: 'senior'             // Will match 'Senior' 
    }
  });
  
  // Then, promote each one individually
  let promotedCount = 0;
  
  for (const engineer of seniorEngineers.data) {
    const promote = await excelTool.execute({
      operation: 'write',
      filePath: './data/employees.xlsx',
      rowIndex: engineer._rowIndex,
      data: {
        Level: 'Principal',
        Salary: Number(engineer.Salary) * 1.15, // 15% raise
        LastPromoted: new Date().toISOString()
      }
    });
    
    if (promote.success) {
      promotedCount++;
    }
  }
  
  console.log(`Promoted ${promotedCount} engineers to Principal level`);
}
```

## Limitations

- The tool assumes the first row of the Excel file contains headers
- Complex cell types like formulas or hyperlinks are treated as their resolved values
- Excel features like merging cells, formatting, or charts are not supported by this tool
- The describe operation shows only a sample of rows, not the entire file content