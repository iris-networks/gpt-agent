# RPA Parameterization Implementation Summary

## Overview

We've implemented a focused RPA parameterization system that:

1. Only allows overriding "type" action content values
2. Provides a parameter template API to discover parameterizable fields
3. Supports batch execution with different parameter sets

## Implementation Details

### 1. DTOs and API Models

- Added `parameterOverrides` field to `StartRpaExecutionDto` to allow parameter substitution
- Created `ParameterTemplateResponseDto` for the parameter discovery API response
- Added `BatchExecuteRpaDto` for executing multiple runs with different parameters

### 2. RPA Service

#### Parameter Overrides

Implemented `applyParameterOverrides()` method that:
- Only applies overrides to 'type' actions
- Specifically targets the `content` field
- Validates paths before applying changes
- Logs success and failure of overrides

```typescript
private applyParameterOverrides(actions: RpaAction[], overrides: Record<string, any>): void {
  for (const [path, value] of Object.entries(overrides)) {
    // Get action index from path
    const actionIndex = parseInt(path.split('.')[0], 10);
    const action = actions[actionIndex];
    
    // Skip non-type actions
    if (action.actionType !== 'type') {
      this.logger.warn(`Skipping parameter override for non-type action: ${path}`);
      continue;
    }
    
    // Only accept content field overrides
    if (path === `${actionIndex}.action_inputs.content`) {
      action.actionInputs.content = value;
      this.logger.log(`Applied parameter override to type action: ${path}`);
    }
  }
}
```

#### Parameter Template

Implemented `getParameterTemplate()` method that:
- Extracts all 'type' actions from a recording
- Creates a template with paths and default values
- Provides descriptive information for each parameter

```typescript
async getParameterTemplate(recordingId: string): Promise<ParameterTemplateResponseDto> {
  // Extract actions
  const actions = this.extractActionsFromCaptions(captions);
  
  // Find all "type" actions
  const parameterTemplate = {};
  
  actions.forEach((action, index) => {
    if (action.actionType === 'type' && action.actionInputs?.content) {
      const key = `${index}.action_inputs.content`;
      parameterTemplate[key] = {
        defaultValue: action.actionInputs.content,
        actionIndex: index,
        description: `Type action at step ${index + 1}`
      };
    }
  });
  
  return { recordingId, parameterTemplate };
}
```

#### Batch Execution

Implemented `batchExecute()` method for running multiple executions:
- Takes an array of parameter sets
- Executes each set as a separate run
- Returns array of execution IDs

### 3. RPA Controller

Added three new endpoints:

#### `/api/rpa/:recordingId/parameter-template` (GET)
- Returns all parameterizable fields in a recording
- Shows default values and descriptions

#### `/api/rpa/execute` (POST) - Updated
- Now accepts `parameterOverrides` in the request
- Applies overrides before execution

#### `/api/rpa/batch-execute` (POST)
- Accepts multiple parameter sets
- Starts a separate execution for each set

### 4. Frontend UI

Enhanced the CaptionEditor component:
- Added "Parameter Paths" section that shows:
  - Available parameter paths for type actions
  - Current values for each parameter
  - Example API call with parameter overrides

## How to Use

### 1. Discover Parameterizable Fields

Call the parameter template endpoint to see what can be parameterized:

```bash
GET /api/rpa/{recordingId}/parameter-template
```

Response:
```json
{
  "recordingId": "your_recording_id",
  "parameterTemplate": {
    "2.action_inputs.content": {
      "defaultValue": "Original search text",
      "actionIndex": 2,
      "description": "Type action at step 3"
    }
  }
}
```

### 2. Execute with Parameter Overrides

Use the template to create parameter overrides:

```bash
POST /api/rpa/execute
{
  "recordingId": "your_recording_id",
  "parameterOverrides": {
    "2.action_inputs.content": "New search term"
  }
}
```

### 3. Batch Execution

Run multiple executions with different parameters:

```bash
POST /api/rpa/batch-execute
{
  "recordingId": "your_recording_id",
  "parameterSets": [
    {
      "name": "Set 1",
      "parameterOverrides": {
        "2.action_inputs.content": "First search term"
      }
    },
    {
      "name": "Set 2",
      "parameterOverrides": {
        "2.action_inputs.content": "Second search term"
      }
    }
  ]
}
```

## Next Steps and Future Enhancements

1. **Frontend Form**: Create a dedicated UI for providing parameter values at runtime
2. **CSV Import**: Support importing parameter sets from CSV for batch processing
3. **Result Aggregation**: Add functionality to collect and aggregate results from batch runs
4. **Parallel Execution**: Support running multiple parameter sets concurrently