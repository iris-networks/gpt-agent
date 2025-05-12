# RPA Excel Import Feature Design

## Overview

This design document outlines the approach for implementing a feature that allows users to upload Excel/CSV files and map their contents to RPA executions. This will enable batch processing of workflows with data from spreadsheets, making the system more versatile for business automation scenarios.

## Requirements

1. Allow users to upload Excel (.xlsx, .xls) and CSV files
2. Parse the spreadsheet data and extract column headers and content
3. Provide a UI to map spreadsheet columns to RPA parameters
4. Support conditions and transformations on the data
5. Store mappings for reuse
6. Execute RPA workflows based on the mapped data
7. Report back execution results and allow updates to the source data

## Architecture

### Components

1. **File Upload Service**: Handles file uploads and initial parsing
2. **Data Mapping Service**: Manages the mapping between spreadsheet columns and RPA parameters
3. **Data Processing Service**: Applies conditions and transformations to the data
4. **Execution Service**: Coordinates RPA executions based on processed data
5. **Results Service**: Collects and reports execution results
6. **Storage Service**: Persists mappings, templates, and execution histories

### Database Schema

We'll use SQLite for simplicity, scalability, and to support conditions and data manipulation:

```sql
-- Stores uploaded files metadata
CREATE TABLE data_sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  file_type TEXT NOT NULL,  -- "excel", "csv"
  created_at INTEGER NOT NULL,
  column_headers TEXT NOT NULL,  -- JSON array of column names
  sample_data TEXT NOT NULL,  -- JSON array of sample rows
  file_path TEXT NOT NULL
);

-- Stores mapping templates
CREATE TABLE mapping_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Stores column mappings
CREATE TABLE column_mappings (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL,
  source_column TEXT NOT NULL,  -- Column name from spreadsheet
  target_parameter TEXT NOT NULL,  -- RPA parameter path
  transformation TEXT,  -- Optional transformation expression
  condition TEXT,  -- Optional condition expression
  FOREIGN KEY (template_id) REFERENCES mapping_templates(id)
);

-- Stores execution batches
CREATE TABLE execution_batches (
  id TEXT PRIMARY KEY,
  data_source_id TEXT NOT NULL,
  template_id TEXT NOT NULL,
  recording_id TEXT NOT NULL,
  status TEXT NOT NULL,  -- "pending", "running", "completed", "failed"
  created_at INTEGER NOT NULL,
  completed_at INTEGER,
  total_rows INTEGER NOT NULL,
  processed_rows INTEGER NOT NULL DEFAULT 0,
  successful_rows INTEGER NOT NULL DEFAULT 0,
  failed_rows INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (data_source_id) REFERENCES data_sources(id),
  FOREIGN KEY (template_id) REFERENCES mapping_templates(id)
);

-- Stores individual row executions
CREATE TABLE row_executions (
  id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL,
  row_index INTEGER NOT NULL,
  row_data TEXT NOT NULL,  -- JSON of original row data
  parameter_overrides TEXT NOT NULL,  -- JSON of processed parameters
  execution_id TEXT,  -- RPA execution ID
  status TEXT NOT NULL,  -- "pending", "running", "completed", "failed"
  error_message TEXT,
  created_at INTEGER NOT NULL,
  completed_at INTEGER,
  FOREIGN KEY (batch_id) REFERENCES execution_batches(id)
);
```

## Implementation Plan

### 1. File Upload Controller and Service

Create a controller for file uploads with endpoints to:
- Upload Excel/CSV files
- Parse headers and sample data
- Store file metadata

### 2. Data Mapping Controller and Service

Create interfaces for mapping column data to RPA parameters:
- Create/edit/delete mapping templates
- Map source columns to RPA parameters
- Configure transformations and conditions
- Save and load mapping configurations

### 3. Data Processing Service

Implement a service to:
- Process data rows according to mappings
- Apply conditions to filter rows
- Apply transformations to data
- Generate parameter sets for RPA execution

### 4. Execution Controller and Service

Extend the existing RPA controller to:
- Accept a data source and mapping template
- Process data and generate execution batches
- Queue and execute RPA runs for each data row
- Track execution progress and results

### 5. UI Components

Develop UI components for:
- File upload and preview
- Column mapping interface
- Transformation and condition builders
- Execution monitoring dashboard
- Results viewer

## Technical Considerations

### Data Transformations

Support the following transformations:
- String operations (concat, substring, replace, case conversion)
- Numeric operations (add, subtract, multiply, divide)
- Date/time operations (format, extract, calculate)
- Conditional logic (if/then/else)

### Execution Optimization

For large datasets:
- Implement pagination and batching
- Support parallel execution with configurable concurrency
- Allow pause/resume of batch executions
- Implement retry mechanisms for failed executions

### Security Considerations

- Validate uploaded files for size and content
- Sanitize all inputs before processing
- Implement proper access controls
- Validate expressions to prevent injection attacks

## Integration with Existing System

This feature will integrate with the existing RPA system by:
1. Using the `StartRpaExecutionDto` for individual executions
2. Leveraging the existing parameter override mechanism
3. Utilizing the current RPA execution tracking

The batch execution will coordinate multiple RPA executions rather than using the existing `batchExecute` method, as this gives us more control and better reporting.

## Future Enhancements

Potential future improvements:
1. Support for database sources beyond spreadsheets
2. Advanced data validation rules
3. Execution scheduling and automation
4. Two-way synchronization with data sources
5. Execution dependency chains and workflows
6. Custom scripting for complex transformations

## Conclusion

This Excel import feature will significantly enhance the RPA system's capabilities by enabling data-driven automation. By mapping spreadsheet data to RPA parameters, users can easily automate repetitive tasks across multiple data points without manual intervention.