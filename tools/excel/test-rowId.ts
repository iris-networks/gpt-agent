/**
 * Test file to verify rowId is correctly included in Excel operations
 * Run with: ts-node test-rowId.ts
 */

import { 
  describeExcelFile,
  readRowByIndex,
  queryRows
} from './operations';
import * as path from 'path';

async function runTests() {
  // You may need to adjust this path to point to a valid Excel file for testing
  const testFilePath = path.join(__dirname, '../../test-data/sample.xlsx');
  
  try {
    console.log('Testing describeExcelFile:');
    const describeResult = await describeExcelFile(testFilePath);
    if (describeResult.success && describeResult.data) {
      const sampleData = describeResult.data.sheets[0].sampleData;
      console.log('Sample data includes rowId:', sampleData.length > 0 && 'rowId' in sampleData[0]);
      console.log('Sample rowId:', sampleData.length > 0 ? sampleData[0].rowId : 'No sample data');
    } else {
      console.log('Describe failed:', describeResult.error);
    }
    
    console.log('\nTesting readRowByIndex:');
    const readResult = await readRowByIndex(testFilePath, 2); // Row 2 (first data row)
    if (readResult.success && readResult.data) {
      console.log('Read data includes rowId:', 'rowId' in readResult.data);
      console.log('Read rowId:', readResult.data.rowId);
    } else {
      console.log('Read failed:', readResult.error);
    }
    
    console.log('\nTesting queryRows:');
    // Simple query that should match at least one row
    const queryResult = await queryRows(testFilePath, {});
    if (queryResult.success && queryResult.data && queryResult.data.length > 0) {
      console.log('Query data includes rowId:', 'rowId' in queryResult.data[0]);
      console.log('Query rowId:', queryResult.data[0].rowId);
    } else {
      console.log('Query failed or returned no results:', queryResult.error || 'No matches');
    }
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

runTests();