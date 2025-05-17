import * as ExcelJS from 'exceljs';
import { QueryOperator, AdvancedQueryCondition } from './types';

/**
 * Helper function to get headers from a worksheet
 * @param worksheet ExcelJS Worksheet
 * @returns Array of header strings
 */
export function getHeaders(worksheet: ExcelJS.Worksheet): string[] {
  const headerRow = worksheet.getRow(1);
  const headers: string[] = [];

  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const headerValue = cell.value?.toString() || `Column${colNumber}`;
    headers.push(headerValue);
  });

  return headers;
}

/**
 * Compare values with case-insensitive matching for strings and loose equality for other types
 * @param value1 First value to compare
 * @param value2 Second value to compare
 * @returns True if values match, false otherwise
 */
export function compareValues(value1: any, value2: any): boolean {
  // If both values are strings, do case-insensitive comparison
  if (typeof value1 === 'string' && typeof value2 === 'string') {
    return value1.toLowerCase() === value2.toLowerCase();
  }

  // Otherwise, use loose equality (==) instead of strict equality (===)
  // eslint-disable-next-line eqeqeq
  return value1 == value2;
}

/**
 * Check if a value matches a condition with the specified operator
 * @param cellValue Value from the Excel cell
 * @param condition Condition to check against (can be a simple value or an advanced condition)
 * @returns True if the condition is satisfied, false otherwise
 */
export function matchesCondition(cellValue: any, condition: any): boolean {
  // Handle null/undefined cell values
  if (cellValue === null || cellValue === undefined) {
    cellValue = '';
  }

  // Convert cell value to string for string operations
  const cellValueStr = String(cellValue).toLowerCase();

  // If condition is an advanced query condition
  if (condition && typeof condition === 'object' && 'operator' in condition) {
    const { operator, value } = condition as AdvancedQueryCondition;

    switch (operator) {
      case QueryOperator.EQUALS:
        return compareValues(cellValue, value);

      case QueryOperator.NOT_EQUALS:
        return !compareValues(cellValue, value);

      case QueryOperator.GREATER_THAN:
        return Number(cellValue) > Number(value);

      case QueryOperator.GREATER_THAN_OR_EQUALS:
        return Number(cellValue) >= Number(value);

      case QueryOperator.LESS_THAN:
        return Number(cellValue) < Number(value);

      case QueryOperator.LESS_THAN_OR_EQUALS:
        return Number(cellValue) <= Number(value);

      case QueryOperator.CONTAINS:
        return typeof value === 'string' &&
          cellValueStr.includes(value.toLowerCase());

      case QueryOperator.STARTS_WITH:
        return typeof value === 'string' &&
          cellValueStr.startsWith(value.toLowerCase());

      case QueryOperator.ENDS_WITH:
        return typeof value === 'string' &&
          cellValueStr.endsWith(value.toLowerCase());

      case QueryOperator.EXISTS:
        return cellValue !== null && cellValue !== undefined && cellValue !== '';

      case QueryOperator.NOT_EXISTS:
        return cellValue === null || cellValue === undefined || cellValue === '';

      default:
        return false;
    }
  }

  // Default case: simple equality comparison
  return compareValues(cellValue, condition);
}