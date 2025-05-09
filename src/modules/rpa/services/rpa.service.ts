/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { OperatorFactoryService } from '../../operators/services/operator-factory.service';
import { VideoStorageService } from '../../sessions/services/video-storage.service';
import { OperatorType } from '@app/shared/constants';
import { CaptionData, VideoRecording } from '@app/shared/types';
import { StartRpaExecutionDto, RpaExecutionStatusDto, RpaExecutionStatus } from '../dto/rpa.dto';
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
}