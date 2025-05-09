# RPA Implementation Plan for Zenobia

## Overview

This document outlines the implementation plan for adding Robotic Process Automation (RPA) capabilities to Zenobia. The system will leverage existing caption data that includes coordinates of clicks and input actions to build an automated replay system.

## Current System Analysis

After reviewing the codebase, I've identified the following key components:

1. **Caption Data Structure**:
   - Stored in `captions.json`
   - Contains detailed action information including:
     - Timestamps
     - Action types (click, type, hotkey)
     - Coordinates for clicks
     - Input content for typing
     - User/assistant conversation data

2. **Operator Types**:
   - `BROWSER` - Browser automation via IrisBrowserOperator
   - `COMPUTER` - Desktop automation via NutJSOperator

3. **Key Integration Points**:
   - `OperatorFactoryService` - Creates automation operators
   - Session management services handle execution flow
   - Existing execute API endpoint defined in constants
   - Browser/Computer operators have execute functions that can run specific actions

## Implementation Plan

### 1. Create RPA Module Structure

```
src/modules/rpa/
├── controllers/
│   └── rpa.controller.ts  
├── services/
│   └── rpa.service.ts
├── dto/
│   └── rpa.dto.ts
└── rpa.module.ts
```

### 2. Controller Implementation

The RPA controller will expose endpoints for:

- Starting an RPA sequence from a specific caption file/recording
- Stopping an ongoing RPA sequence
- Getting status of current RPA execution
- Supporting execution for both browser and computer automation

### 3. Service Implementation

The RPA service will:

- Parse caption data to extract action sequences
- Create a proper execution plan for each sequence
- Determine the correct operator type automatically based on the source recording
- Utilize existing operator.execute() functionality
- Track execution progress
- Implement retry and error handling mechanisms

### 4. Data Transfer Objects

```typescript
// RPA Execution Request
export class StartRpaExecutionDto {
  @ApiProperty({
    description: 'The ID of the recording or source of caption data'
  })
  recordingId: string;

  @ApiProperty({
    description: 'Optional delay between actions in milliseconds',
    default: 1000,
    required: false
  })
  actionDelay?: number;
}

// RPA Execution Status Response
export class RpaExecutionStatusDto {
  @ApiProperty({
    description: 'The ID of the RPA execution'
  })
  executionId: string;

  @ApiProperty({
    description: 'Current status of the execution',
    enum: ['running', 'completed', 'failed', 'stopped']
  })
  status: string;

  @ApiProperty({
    description: 'Current action index being executed'
  })
  currentActionIndex: number;

  @ApiProperty({
    description: 'Total number of actions to execute'
  })
  totalActions: number;

  @ApiProperty({
    description: 'Error message if execution failed',
    required: false
  })
  errorMessage?: string;
}
```

### 5. API Endpoints

```typescript
@ApiTags('rpa')
@Controller('rpa')
export class RpaController {
  constructor(private readonly rpaService: RpaService) {}

  @Post('execute')
  @ApiOperation({ summary: 'Start RPA execution from a recording' })
  @ApiResponse({ status: 201, description: 'RPA execution started', type: RpaExecutionStatusDto })
  startExecution(@Body() startRpaDto: StartRpaExecutionDto): Promise<RpaExecutionStatusDto> {
    return this.rpaService.startExecution(startRpaDto);
  }

  @Post(':executionId/stop')
  @ApiOperation({ summary: 'Stop an ongoing RPA execution' })
  @ApiResponse({ status: 200, description: 'RPA execution stopped', type: RpaExecutionStatusDto })
  stopExecution(@Param('executionId') executionId: string): Promise<RpaExecutionStatusDto> {
    return this.rpaService.stopExecution(executionId);
  }

  @Get(':executionId/status')
  @ApiOperation({ summary: 'Get status of an RPA execution' })
  @ApiResponse({ status: 200, description: 'RPA execution status', type: RpaExecutionStatusDto })
  getExecutionStatus(@Param('executionId') executionId: string): Promise<RpaExecutionStatusDto> {
    return this.rpaService.getExecutionStatus(executionId);
  }
}
```

### 6. Service Implementation Details

The RPA service will:

1. Parse the caption data to extract actionable steps
2. Create an execution context with appropriate operator
3. Execute each action sequentially with proper error handling
4. Track execution progress and maintain status

```typescript
@Injectable()
export class RpaService {
  private activeExecutions = new Map<string, RpaExecutionContext>();

  constructor(
    private readonly operatorFactoryService: OperatorFactoryService,
    private readonly videoStorageService: VideoStorageService,
  ) {}

  async startExecution(startDto: StartRpaExecutionDto): Promise<RpaExecutionStatusDto> {
    // 1. Generate unique execution ID
    const executionId = `rpa_${Date.now()}`;
    
    // 2. Get recording metadata to determine the correct operator type
    const recording = await this.videoStorageService.getRecording(startDto.recordingId);
    
    // 3. Get caption data from recording
    const captions = await this.videoStorageService.getRecordingCaptions(startDto.recordingId);
    
    // 4. Determine the operator type from the recording information
    // This would typically be stored as part of the session metadata
    // or determined from the captions contents
    const sessionMetadata = await this.getSessionMetadata(recording.sessionId);
    const operatorType = sessionMetadata.operatorType;
    
    // 5. Extract actions from captions
    const actions = this.extractActionsFromCaptions(captions);
    
    // 6. Create operator for execution using the original type
    const operator = await this.operatorFactoryService.createOperator(operatorType);
    
    // 7. Create execution context
    const executionContext: RpaExecutionContext = {
      executionId,
      operator,
      operatorType,
      actions,
      status: 'running',
      currentActionIndex: 0,
      totalActions: actions.length,
      abortController: new AbortController(),
      actionDelay: startDto.actionDelay || 1000,
    };
    
    // 6. Store execution context
    this.activeExecutions.set(executionId, executionContext);
    
    // 7. Start execution in background
    this.executeActionsSequentially(executionContext)
      .catch(error => {
        executionContext.status = 'failed';
        executionContext.errorMessage = error.message;
      });
    
    // 8. Return initial status
    return this.getExecutionStatus(executionId);
  }

  // Additional methods for execution management...
}
```

### 7. Integration with Existing Services

- Leverage existing operator factory service for creating automation operators
- Use existing video/screenshot services for visual feedback
- Consider integration with session management for status updates

## Technical Considerations

1. **Operator Type Determination**:
   - The RPA service must retrieve the original operator type from the session metadata
   - If session metadata is not available, analyze captions to determine the appropriate operator type
   - Implement fallback mechanisms if operator type cannot be determined

2. **Execution Context Management**:
   - Store active execution contexts in memory with proper clean-up mechanisms
   - Consider persistence for long-running operations

3. **Error Handling**:
   - Implement retry mechanisms for failed actions
   - Allow for timeout configurations
   - Detect and handle visual state changes that might affect action execution

4. **Security Considerations**:
   - Validate input parameters to prevent injection attacks
   - Implement proper authorization checks for RPA operations

5. **Performance Optimization**:
   - Process caption data efficiently, especially for large recordings
   - Implement optimized wait strategies between actions

6. **Extensibility**:
   - Design the RPA service to be extensible for future enhancements
   - Allow for custom action handlers

## Future Enhancements

1. Add support for conditional execution based on visual state
2. Implement action recording directly from the UI for RPA creation
3. Add scheduling capabilities for recurring RPA tasks
4. Develop a visual editor for RPA sequences
5. Support for parameterized RPA executions (data-driven automation)