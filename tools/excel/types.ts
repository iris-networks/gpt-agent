/**
 * Result type for describe operation
 */
export type DescribeResult = {
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
};

/**
 * Result type for read operation
 */
export type ReadResult = {
  success: boolean;
  data: (Record<string, any> & { rowId: number }) | null;
  error: string | null;
};

/**
 * Result type for query operation
 */
export type QueryResult = {
  success: boolean;
  data: (Record<string, any> & { rowId: number })[] | null;
  error: string | null;
};

/**
 * Result type for write and update operations
 */
export type WriteResult = {
  success: boolean;
  rowsUpdated: number;
  error: string | null;
};

/**
 * Union type for all operation results
 */
export type ExcelOperationResult = DescribeResult | ReadResult | QueryResult | WriteResult;

/**
 * Operation types
 */
export type ExcelOperation = 'describe' | 'read' | 'query' | 'write' | 'update';

/**
 * Query operator types
 */
export enum QueryOperator {
  EQUALS = 'eq',
  NOT_EQUALS = 'neq',
  GREATER_THAN = 'gt',
  GREATER_THAN_OR_EQUALS = 'gte',
  LESS_THAN = 'lt',
  LESS_THAN_OR_EQUALS = 'lte',
  CONTAINS = 'contains',
  STARTS_WITH = 'startsWith',
  ENDS_WITH = 'endsWith',
  EXISTS = 'exists',
  NOT_EXISTS = 'notExists',
}

/**
 * Advanced query condition
 */
export type AdvancedQueryCondition = {
  operator: QueryOperator;
  value: any;
};

/**
 * Advanced query format that supports operators
 */
export type AdvancedQuery = Record<string, AdvancedQueryCondition | any>;

/**
 * Query with find one option
 */
export type QueryOptions = {
  findOne?: boolean;  // If true, return only the first matching row
  limit?: number;     // Limit the number of returned rows
  offset?: number;    // Skip the first n rows
  sortBy?: string;    // Column to sort by
  sortDir?: 'asc' | 'desc';  // Sort direction
};