/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { OperatorFactoryService } from '../../operators/services/operator-factory.service';
import { VideoStorageService } from '../../sessions/services/video-storage.service';
import { OperatorType } from '@app/shared/constants';
import { CaptionData, VideoRecording } from '@app/shared/types';
import { 
  StartRpaExecutionDto, 
  RpaExecutionStatusDto, 
  RpaExecutionStatus,
  BatchExecuteRpaDto,
  ParameterTemplateResponseDto,
  SimpleSuccessResponseDto
} from '../dto/rpa.dto';
import { Operator } from '@ui-tars/sdk/dist/core';
import { ExecuteParams } from '@app/packages/ui-tars-sdk';
import { DEFAULT_FACTORS } from '@app/packages/ui-tars-sdk/constants';

/**
 * Interface for an RPA action
 */
interface RpaAction {
  actionType: string;
  actionInputs: any;
  coordinates?: { x: number; y: number };
  screenWidth: number;
  screenHeight: number;
  scaleFactor: number;
}

/**
 * Interface for RPA execution context
 */
interface RpaExecutionContext {
  executionId: string;
  recordingId: string;
  operator: Operator;
  operatorType: OperatorType;
  actions: RpaAction[];
  status: RpaExecutionStatus;
  currentActionIndex: number;
  totalActions: number;
  startedAt: number;
  completedAt?: number;
  abortController: AbortController;
  actionDelay: number;
  errorMessage?: string;
}

/**
 * Service responsible for RPA executions
 */
@Injectable()
export class RpaService {
  private readonly logger = new Logger(RpaService.name);
  private activeExecutions = new Map<string, RpaExecutionContext>();

  constructor(
    private readonly operatorFactoryService: OperatorFactoryService,
    private readonly videoStorageService: VideoStorageService,
  ) {}

  /**
   * Start a new RPA execution from recording captions
   * @param startDto Parameters for starting execution
   * @returns Status of the initiated execution
   */
  async startExecution(startDto: StartRpaExecutionDto): Promise<RpaExecutionStatusDto> {
    try {
      // Generate unique execution ID
      const executionId = `rpa_${Date.now()}`;
      this.logger.log(`Starting RPA execution ${executionId} from recording ${startDto.recordingId}`);
      
      // Get recording metadata
      const recording = await this.videoStorageService.getRecording(startDto.recordingId);
      
      // Get captions
      const captions = await this.videoStorageService.getRecordingCaptions(startDto.recordingId);
      if (!captions || captions.length === 0) {
        throw new BadRequestException(`No captions found for recording ${startDto.recordingId}`);
      }
      
      // Get the operator type directly from the recording metadata
      const operatorType = recording.operatorType || OperatorType.BROWSER;
      this.logger.log(`Using operator type: ${operatorType} for RPA execution ${executionId}`);
      
      // Extract actions
      const actions = this.extractActionsFromCaptions(captions);
      if (!actions || actions.length === 0) {
        throw new BadRequestException(`No automatable actions found in captions for recording ${startDto.recordingId}`);
      }
      
      // Apply parameter overrides if provided
      if (startDto.parameterOverrides) {
        this.logger.log(`Applying parameter overrides for execution ${executionId}`);
        this.applyParameterOverrides(actions, startDto.parameterOverrides);
      }
      
      // Create operator
      const operator = await this.operatorFactoryService.createOperator(operatorType);
      
      // Create execution context
      const executionContext: RpaExecutionContext = {
        executionId,
        recordingId: startDto.recordingId,
        operator,
        operatorType,
        actions,
        status: RpaExecutionStatus.RUNNING,
        currentActionIndex: 0,
        totalActions: actions.length,
        startedAt: Date.now(),
        abortController: new AbortController(),
        actionDelay: startDto.actionDelay || 1000,
      };
      
      // Store execution context
      this.activeExecutions.set(executionId, executionContext);
      
      // Start execution in background
      this.executeActionsSequentially(executionContext)
        .then(() => {
          this.logger.log(`RPA execution ${executionId} completed successfully`);
          executionContext.status = RpaExecutionStatus.COMPLETED;
          executionContext.completedAt = Date.now();
          // Clean up after some time to allow status queries
          setTimeout(() => {
            this.cleanupExecution(executionId);
          }, 30 * 60 * 1000); // Clean up after 30 minutes
        })
        .catch(error => {
          this.logger.error(`RPA execution ${executionId} failed: ${error.message}`, error.stack);
          executionContext.status = RpaExecutionStatus.FAILED;
          executionContext.errorMessage = error.message;
          // Clean up after some time to allow status queries
          setTimeout(() => {
            this.cleanupExecution(executionId);
          }, 30 * 60 * 1000); // Clean up after 30 minutes
        });
      
      // Return initial status
      return this.getExecutionStatus(executionId);
    } catch (error) {
      this.logger.error(`Failed to start RPA execution: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Stop an ongoing RPA execution
   * @param executionId ID of the execution to stop
   * @returns Status of the stopped execution
   */
  async stopExecution(executionId: string): Promise<RpaExecutionStatusDto> {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) {
      throw new NotFoundException(`RPA execution ${executionId} not found`);
    }
    
    this.logger.log(`Stopping RPA execution ${executionId}`);
    
    // Abort any ongoing operations
    execution.abortController.abort();
    execution.status = RpaExecutionStatus.STOPPED;
    
    // Clean up after some time to allow status queries
    setTimeout(() => {
      this.cleanupExecution(executionId);
    }, 30 * 60 * 1000); // Clean up after 30 minutes
    
    return this.getExecutionStatus(executionId);
  }

  /**
   * Get the status of an RPA execution
   * @param executionId ID of the execution
   * @returns Status of the execution
   */
  getExecutionStatus(executionId: string): RpaExecutionStatusDto {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) {
      throw new NotFoundException(`RPA execution ${executionId} not found`);
    }
    
    return {
      executionId: execution.executionId,
      recordingId: execution.recordingId,
      status: execution.status,
      currentActionIndex: execution.currentActionIndex,
      totalActions: execution.totalActions,
      startedAt: execution.startedAt,
      operatorType: execution.operatorType,
      errorMessage: execution.errorMessage,
    };
  }

  /**
   * Clean up an execution and release resources
   * @param executionId ID of the execution to clean up
   */
  private async cleanupExecution(executionId: string): Promise<void> {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) {
      return;
    }
    
    this.logger.log(`Cleaning up RPA execution ${executionId}`);
    
    try {
      // Close operator
      await this.operatorFactoryService.closeOperator(
        execution.operator,
        execution.operatorType
      );
    } catch (error) {
      this.logger.error(`Error closing operator for execution ${executionId}: ${error.message}`);
    }
    
    // Remove from active executions
    this.activeExecutions.delete(executionId);
  }


  /**
   * Extract executable actions from captions
   * @param captions Array of caption data
   * @returns Array of executable RPA actions
   */
  private extractActionsFromCaptions(captions: CaptionData[]): RpaAction[] {
    const actions: RpaAction[] = [];
    
    for (const caption of captions) {
      const conversation = caption.conversation;
      if (!conversation || !conversation.predictionParsed) {
        continue;
      }
      
      const parsedPredictions = conversation.predictionParsed;
      
      for (const prediction of parsedPredictions) {
        // Skip non-action or finished predictions
        if (!prediction.action_type || prediction.action_type === 'finished' || prediction.action_type === 'call_user') {
          continue;
        }
        
        // Get screen context from conversation
        const screenContext = conversation.screenshotContext || {
          size: { width: 1280, height: 800 },
          scaleFactor: 1
        };
        
        // Extract coordinates if present
        let coordinates;
        if (prediction.action_inputs?.start_coords) {
          coordinates = {
            x: prediction.action_inputs.start_coords[0],
            y: prediction.action_inputs.start_coords[1]
          };
        }
        
        // Create action
        const action: RpaAction = {
          actionType: prediction.action_type,
          actionInputs: prediction.action_inputs || {},
          coordinates,
          screenWidth: screenContext.size.width,
          screenHeight: screenContext.size.height,
          scaleFactor: screenContext.scaleFactor
        };
        
        actions.push(action);
      }
    }
    
    return actions;
  }
  
  /**
   * Execute RPA steps generated by Gemini
   * @param sessionId Session ID to execute the steps in
   * @param rpaSteps Steps generated by Gemini
   */
  async executeRPASteps(sessionId: string, rpaSteps: string): Promise<void> {
    this.logger.log(`Executing RPA steps in session ${sessionId}`);
    
    try {
      // Parse the steps and format them for the reAct agent
      const formattedActions = this.formatStepsForReActAgent(rpaSteps);
      
      if (formattedActions.length === 0) {
        throw new BadRequestException('No valid actions could be extracted from RPA steps');
      }
      
      // Get the operator type (assuming browser for now)
      const operatorType = OperatorType.BROWSER;
      
      // Create operator
      const operator = await this.operatorFactoryService.createOperator(operatorType);
      
      // Generate unique execution ID
      const executionId = `rpa_gemini_${Date.now()}`;
      
      // Convert formatted actions to RPA actions
      const rpaActions: RpaAction[] = formattedActions.map(action => {
        const rpaAction: RpaAction = {
          actionType: this.mapActionTypeToRpa(action),
          actionInputs: this.mapActionInputsToRpa(action),
          coordinates: action.x !== undefined && action.y !== undefined ? { x: action.x, y: action.y } : undefined,
          screenWidth: 1280,  // Default screen width
          screenHeight: 800,  // Default screen height
          scaleFactor: 1      // Default scale factor
        };
        return rpaAction;
      });
      
      // Create execution context
      const executionContext: RpaExecutionContext = {
        executionId,
        recordingId: 'gemini_generated',  // Mark as generated by Gemini
        operator,
        operatorType,
        actions: rpaActions,
        status: RpaExecutionStatus.RUNNING,
        currentActionIndex: 0,
        totalActions: rpaActions.length,
        startedAt: Date.now(),
        abortController: new AbortController(),
        actionDelay: 1000,  // Default delay
      };
      
      // Store execution context
      this.activeExecutions.set(executionId, executionContext);
      
      // Start execution in background
      this.executeActionsSequentially(executionContext)
        .then(() => {
          this.logger.log(`RPA execution ${executionId} completed successfully`);
          executionContext.status = RpaExecutionStatus.COMPLETED;
          executionContext.completedAt = Date.now();
          setTimeout(() => this.cleanupExecution(executionId), 30 * 60 * 1000);
        })
        .catch(error => {
          this.logger.error(`RPA execution ${executionId} failed: ${error.message}`, error.stack);
          executionContext.status = RpaExecutionStatus.FAILED;
          executionContext.errorMessage = error.message;
          setTimeout(() => this.cleanupExecution(executionId), 30 * 60 * 1000);
        });
        
      this.logger.log(`Started RPA execution ${executionId} from Gemini-generated steps`);
    } catch (error) {
      this.logger.error(`Failed to execute RPA steps: ${error.message}`, error.stack);
      throw error;
    }
  }
  
  /**
   * Format the steps generated by Gemini for the reAct agent
   * @param steps Raw steps from Gemini
   * @returns Formatted actions for reAct agent
   */
  private formatStepsForReActAgent(steps: string): any[] {
    // This is a simple implementation that assumes the steps are in a numbered list format
    
    const lines = steps.split('\n').filter(line => line.trim() !== '');
    const formattedSteps = [];
    
    for (const line of lines) {
      // Skip non-step lines (like headers or explanations)
      if (!/^\d+\./.test(line)) continue;
      
      const stepContent = line.replace(/^\d+\.\s*/, '').trim();
      
      if (stepContent.toLowerCase().includes('mouse move')) {
        // Extract coordinates for mouse move
        const match = stepContent.match(/\((\d+),\s*(\d+)\)/);
        if (match) {
          formattedSteps.push({
            action: 'mouseMove',
            x: parseInt(match[1], 10),
            y: parseInt(match[2], 10),
          });
        }
      } else if (stepContent.toLowerCase().includes('click')) {
        // Extract coordinates for click if available
        const match = stepContent.match(/\((\d+),\s*(\d+)\)/);
        if (match) {
          formattedSteps.push({
            action: 'mouseClick',
            button: 'left', // Default to left button
            x: parseInt(match[1], 10),
            y: parseInt(match[2], 10),
          });
        } else {
          formattedSteps.push({
            action: 'mouseClick',
            button: 'left', // Default to left button
          });
        }
      } else if (stepContent.toLowerCase().includes('type')) {
        // Extract text to type
        const match = stepContent.match(/type\s*["'](.+?)["']/i) || 
                      stepContent.match(/type\s+(.+?)(\s|$)/i);
        if (match) {
          formattedSteps.push({
            action: 'type',
            text: match[1],
          });
        }
      } else if (stepContent.toLowerCase().includes('press')) {
        // Extract key to press
        const match = stepContent.match(/press\s*(.+?)(key|\s|$)/i);
        if (match) {
          formattedSteps.push({
            action: 'keyPress',
            key: match[1].trim(),
          });
        }
      } else if (stepContent.toLowerCase().includes('wait')) {
        // Extract wait duration
        const match = stepContent.match(/wait\s*(\d+)/i);
        if (match) {
          formattedSteps.push({
            action: 'wait',
            duration: parseInt(match[1], 10) * 1000, // Convert to milliseconds
          });
        }
      }
    }
    
    return formattedSteps;
  }
  
  /**
   * Map action type from formatted step to RPA action type
   * @param action Formatted action
   * @returns RPA action type
   */
  private mapActionTypeToRpa(action: any): string {
    switch (action.action) {
      case 'mouseMove':
        return 'move_mouse';
      case 'mouseClick':
        return 'click';
      case 'type':
        return 'type';
      case 'keyPress':
        return 'press_key';
      case 'wait':
        return 'wait';
      default:
        return 'click'; // Default to click
    }
  }
  
  /**
   * Map action inputs from formatted step to RPA action inputs
   * @param action Formatted action
   * @returns RPA action inputs
   */
  private mapActionInputsToRpa(action: any): any {
    switch (action.action) {
      case 'mouseMove':
        return {
          start_coords: [action.x, action.y]
        };
      case 'mouseClick':
        if (action.x !== undefined && action.y !== undefined) {
          return {
            start_coords: [action.x, action.y],
            button: action.button || 'left'
          };
        }
        return {
          button: action.button || 'left'
        };
      case 'type':
        return {
          text: action.text
        };
      case 'keyPress':
        return {
          key: action.key
        };
      case 'wait':
        return {
          ms: action.duration
        };
      default:
        return {};
    }
  }

  /**
   * Execute actions sequentially
   * @param executionContext Execution context
   */
  private async executeActionsSequentially(executionContext: RpaExecutionContext): Promise<void> {
    const { actions, actionDelay, abortController } = executionContext;
    
    for (let i = 0; i < actions.length; i++) {
      // Check if execution should be aborted
      if (abortController.signal.aborted) {
        throw new Error('Execution aborted by user');
      }
      
      // Update current action index
      executionContext.currentActionIndex = i;
      
      // Get current action
      const action = actions[i];
      
      try {
        // Log action execution
        this.logger.log(`Executing action ${i + 1}/${actions.length}: ${action.actionType}`);
        
        // Prepare execute params
        const executeParams: ExecuteParams = {
          prediction: '', // Not used in our case
          parsedPrediction: {
            action_type: action.actionType,
            action_inputs: action.actionInputs,
            thought: '',
            reflection: null,
          },
          screenWidth: action.screenWidth,
          screenHeight: action.screenHeight,
          scaleFactor: action.scaleFactor,
          factors: DEFAULT_FACTORS
        };
        
        // Execute action
        await executionContext.operator.execute(executeParams);
        
        // Wait between actions
        if (i < actions.length - 1) {
          await this.delay(actionDelay);
        }
      } catch (error) {
        this.logger.error(`Action execution failed at index ${i}: ${error.message}`);
        throw new Error(`Failed to execute action ${action.actionType} at index ${i}: ${error.message}`);
      }
    }
    
    // Complete execution
    executionContext.currentActionIndex = actions.length;
    executionContext.status = RpaExecutionStatus.COMPLETED;
    executionContext.completedAt = Date.now();
  }

  /**
   * Helper method for delaying execution
   * @param ms Milliseconds to delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Apply parameter overrides to actions - only for 'type' actions
   * @param actions Array of actions to modify
   * @param overrides Parameter overrides to apply
   */
  private applyParameterOverrides(actions: RpaAction[], overrides: Record<string, any>): void {
    for (const [path, value] of Object.entries(overrides)) {
      try {
        // Simple dot-notation path parser
        const pathParts = path.split('.');
        
        // First part should be the action index
        const actionIndex = parseInt(pathParts[0], 10);
        if (isNaN(actionIndex) || actionIndex < 0 || actionIndex >= actions.length) {
          this.logger.warn(`Invalid action index in parameter override path: ${path}`);
          continue;
        }
        
        // Get the action object
        const action = actions[actionIndex];
        if (!action) {
          this.logger.warn(`Action not found at index ${actionIndex}`);
          continue;
        }
        
        // Only apply overrides to 'type' actions
        if (action.actionType !== 'type') {
          this.logger.warn(`Skipping parameter override for non-type action: ${path}`);
          continue;
        }
        
        // For type actions, we only override the content field
        // Check if this is a content override
        if (path === `${actionIndex}.action_inputs.content`) {
          action.actionInputs.content = value;
          this.logger.log(`Applied parameter override to type action: ${path} = ${JSON.stringify(value)}`);
        } else {
          this.logger.warn(`Skipping parameter override for unsupported path: ${path}`);
        }
      } catch (error) {
        this.logger.error(`Error applying parameter override ${path}: ${error.message}`);
      }
    }
  }
  
  /**
   * Get parameter template for a recording
   * @param recordingId The recording ID
   * @returns Template with all parameterizable fields
   */
  async getParameterTemplate(recordingId: string): Promise<ParameterTemplateResponseDto> {
    this.logger.log(`Generating parameter template for recording ${recordingId}`);
    
    try {
      // Get recording metadata
      const recording = await this.videoStorageService.getRecording(recordingId);
      
      // Get captions
      const captions = await this.videoStorageService.getRecordingCaptions(recordingId);
      if (!captions || captions.length === 0) {
        throw new BadRequestException(`No captions found for recording ${recordingId}`);
      }
      
      // Extract actions
      const actions = this.extractActionsFromCaptions(captions);
      if (!actions || actions.length === 0) {
        throw new BadRequestException(`No automatable actions found in captions for recording ${recordingId}`);
      }
      
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
      
      return {
        recordingId,
        parameterTemplate
      };
    } catch (error) {
      this.logger.error(`Failed to generate parameter template: ${error.message}`, error.stack);
      throw error;
    }
  }
  
  /**
   * Execute multiple RPA runs with different parameter sets
   * @param batchDto Batch execution parameters
   * @returns Array of execution IDs for the started runs
   */
  async batchExecute(batchDto: BatchExecuteRpaDto): Promise<string[]> {
    this.logger.log(`Starting batch execution for recording ${batchDto.recordingId} with ${batchDto.parameterSets.length} parameter sets`);
    
    const executionIds: string[] = [];
    
    // Start each execution with its parameter set
    for (const paramSet of batchDto.parameterSets) {
      try {
        const startDto: StartRpaExecutionDto = {
          recordingId: batchDto.recordingId,
          actionDelay: batchDto.actionDelay,
          parameterOverrides: paramSet.parameterOverrides
        };
        
        // Start the execution
        const result = await this.startExecution(startDto);
        executionIds.push(result.executionId);
        
        this.logger.log(`Started execution ${result.executionId} for parameter set ${paramSet.name || 'unnamed'}`);
      } catch (error) {
        this.logger.error(`Failed to start execution for parameter set ${paramSet.name || 'unnamed'}: ${error.message}`);
      }
    }
    
    return executionIds;
  }
}