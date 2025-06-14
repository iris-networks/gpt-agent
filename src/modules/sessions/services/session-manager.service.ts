/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  SessionDataDto,
  CreateSessionRequestDto,
  SessionResponseDto,
  VideoRecordingDto,
  ScreenshotDto,
  FileMetadataDto
} from '@app/shared/dto';
import { OperatorFactoryService } from '../../operators/services/operator-factory.service';
import { ConfigService } from '../../config/config.service';
import { sessionLogger } from '../../../common/services/logger.service';
import { Interval } from '@nestjs/schedule';
import { SessionEventsService } from './session-events.service';
import { SessionScreenshotsService } from './session-screenshots.service';
import { ReactAgent } from '@app/agents/reAct';
import { FileUploadService } from '@app/modules/file-upload/services/file-upload.service';
import { StatusEnum } from '@app/packages/ui-tars/shared/src/types';

@Injectable()
export class SessionManagerService implements OnModuleInit {
  // Single active session data
  private activeSession: SessionDataDto | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly operatorFactoryService: OperatorFactoryService,
    private readonly sessionEvents: SessionEventsService,
    private readonly screenshotsService: SessionScreenshotsService,
    private readonly fileUploadService: FileUploadService
  ) {}

  async onModuleInit() {
    sessionLogger.info('Session Manager initialized');
  }

  /**
   * Convert fileIds to full file metadata objects
   */
  private async getFileMetadata(fileIds: string[]): Promise<FileMetadataDto[]> {
    if (!fileIds || fileIds.length === 0) {
      return [];
    }

    const fileMetadata: FileMetadataDto[] = [];
    for (const fileId of fileIds) {
      try {
        const fileInfo = await this.fileUploadService.getFileInfo(fileId);
        fileMetadata.push({
          fileId: fileInfo.fileId,
          fileName: fileInfo.fileName,
          mimeType: fileInfo.mimeType,
          fileSize: fileInfo.fileSize
        });
      } catch (error) {
        sessionLogger.warn(`Failed to get metadata for file ID ${fileId}: ${error.message}`);
      }
    }

    return fileMetadata;
  }

  /**
   * Emit a session status update
   */
  private emitSessionUpdate(data: {
    status: StatusEnum;
    conversations?: Array<{
      role: 'user' | 'assistant' | 'system';
      content: string;
      timestamp?: number;
    }>;
    errorMsg?: string;
  }): void {
    if (!this.activeSession || !this.activeSession.id) {
      sessionLogger.warn(`Skipping update emission - no active session`);
      return;
    }

    // Determine the message to send
    let message = '';
    if (data.errorMsg) {
      message = data.errorMsg;
    } else if (data.conversations && data.conversations.length > 0) {
      const lastMsg = data.conversations[data.conversations.length - 1];
      message = lastMsg.content;
    }

    this.sessionEvents.emitStatus(
      message,
      data.status,
      this.activeSession.id,
      data
    );
  }

  /**
   * Create a new session, always replacing any existing session
   */
  public async createSession(request: CreateSessionRequestDto): Promise<string> {
    // Validate instructions
    const { instructions } = request;
    if (!instructions) {
      throw new Error('Instructions are required for new sessions');
    }
    
    // Clean up any existing session
    if (this.activeSession) {
      sessionLogger.info('Cleaning up previous session before creating a new one');
      await this.closeSession();
    }
    
    // Generate a new session ID
    const sessionId = Date.now().toString();
    
    // Get configuration and operator type
    const defaultConfig = this.configService.getConfig();
    const operatorType = request.operator || defaultConfig.defaultOperator;
    
    // Create a new operator
    const operator = await this.operatorFactoryService.createOperator(operatorType);

    // Create the session
    this.activeSession = {
      id: sessionId,
      agent: null, // Will be set after agent creation
      operator,
      conversations: [],
      status: StatusEnum.RUNNING,
      instructions,
      operatorType,
      timestamps: {
        created: Date.now(),
        updated: Date.now()
      }
    };
    
    // Initialize screenshots for this session
    this.screenshotsService.initSessionScreenshots(sessionId);

    // Create a status callback function to emit socket events
    const agentStatusCallback = (message: string, status: StatusEnum, data) => {
      this.sessionEvents.emitStatus(message, status, sessionId, data);
    };

    // Create a new agent
    const agent = new ReactAgent(operator, agentStatusCallback);
    this.activeSession.agent = agent;
    
    try {
      // Handle file metadata
      let fileMetadata = request.files || [];
      if ((!fileMetadata || fileMetadata.length === 0) && request.fileIds && request.fileIds.length > 0) {
        fileMetadata = await this.getFileMetadata(request.fileIds);
        sessionLogger.info(`Retrieved metadata for ${fileMetadata.length} files from IDs`);
      }

      // Execute the agent
      await agent.execute({
        "input": instructions,
        "maxSteps": 20,
        "files": fileMetadata
      });
      
      // Collect screenshots from agent
      if (this.activeSession && typeof agent.getScreenshots === 'function') {
        const agentScreenshots = agent.getScreenshots();
        sessionLogger.info(`Collected ${agentScreenshots.length} screenshots from agent`);
        
        if (agentScreenshots.length > 0) {
          this.screenshotsService.addScreenshots(sessionId, agentScreenshots);
        }
      }
      
      // Update session status on completion
      if (this.activeSession) {
        this.activeSession.status = StatusEnum.END;
        this.activeSession.timestamps.updated = Date.now();
        this.activeSession.timestamps.completed = Date.now();

        // Auto-save the recording when session completes successfully
        try {
          const screenshots = this.screenshotsService.getSessionScreenshots(sessionId);
          if (screenshots && screenshots.length > 0) {
            sessionLogger.info(`Session completed successfully. Auto-saving recording for session ${sessionId}`);
            const recording = await this.screenshotsService.saveSessionRecording(sessionId, operatorType);
            sessionLogger.info(`Auto-saved recording ${recording.id} for completed session ${sessionId}`);
          } else {
            sessionLogger.info(`Session completed but no screenshots to save for session ${sessionId}`);
          }
        } catch (error) {
          sessionLogger.error(`Error auto-saving recording for completed session ${sessionId}:`, error);
        }
      }
    } catch(error) {
      // Don't treat abort errors as real errors
      if (error.name === 'AbortError') {
        sessionLogger.info(`Session execution was aborted as expected`);
        return sessionId;
      }
      
      // Log the full error with stack trace for debugging
      sessionLogger.error(error);
      
      // Try to collect any screenshots that might have been captured before the error
      if (this.activeSession && typeof agent.getScreenshots === 'function') {
        const agentScreenshots = agent.getScreenshots();
        sessionLogger.info(`Collected ${agentScreenshots.length} screenshots from agent (after error)`);
        
        if (agentScreenshots.length > 0) {
          this.screenshotsService.addScreenshots(sessionId, agentScreenshots);
        }
      }
      
      if (this.activeSession) {
        this.activeSession.status = StatusEnum.ERROR;

        // Parse and enhance error message
        let errorMsg = error.message;
        if (errorMsg.includes("did not match schema")) {
          errorMsg = `Schema validation error: ${errorMsg}. Check agent implementation in agents/reAct.ts`;
        }

        this.activeSession.errorMsg = errorMsg;
        this.activeSession.timestamps.updated = Date.now();
        this.emitSessionUpdate({
          status: StatusEnum.ERROR,
          errorMsg: errorMsg,
          conversations: this.activeSession.conversations
        });
      }
    }

    return sessionId;
  }

  /**
   * Update an existing session with new instructions
   * Reuses the existing agent but interrupts any ongoing execution
   */
  public async updateSession(request: CreateSessionRequestDto): Promise<string> {
    // Validate instructions
    const { instructions } = request;
    if (!instructions) {
      throw new Error('Instructions are required for session updates');
    }

    // Check if we have an active session
    if (!this.activeSession || !this.activeSession.agent) {
      throw new Error('No active session found to update');
    }
    
    // Get the existing session ID and agent
    const sessionId = this.activeSession.id;
    const agent = this.activeSession.agent;
    
    // Add the new instruction to conversations
    if (!this.activeSession.conversations) {
      this.activeSession.conversations = [];
    }
    
    this.activeSession.conversations.push({
      role: 'user',
      content: instructions,
      timestamp: Date.now()
    });
    
    // If the session is running, interrupt it
    if (this.activeSession.status === StatusEnum.RUNNING) {
      sessionLogger.info(`Interrupting running session ${sessionId} for new message`);
      
      // Emit status update about interruption
      this.emitSessionUpdate({
        status: StatusEnum.PAUSE,
        conversations: this.activeSession.conversations
      });
      
      // Use the abort controller to stop current execution
      if (agent.abortController) {
        try {
          agent.abortController.abort();
          agent.abortController = new AbortController();
          sessionLogger.info(`Successfully interrupted execution of session ${sessionId}`);
        } catch (error) {
          sessionLogger.warn(`Error interrupting session execution: ${error.message}`);
        }
      }
    }
    
    // Update session state
    this.activeSession.instructions = instructions;
    this.activeSession.status = StatusEnum.RUNNING;
    this.activeSession.timestamps.updated = Date.now();
    
    try {
      // Handle file metadata
      let fileMetadata = request.files || [];
      if ((!fileMetadata || fileMetadata.length === 0) && request.fileIds && request.fileIds.length > 0) {
        fileMetadata = await this.getFileMetadata(request.fileIds);
        sessionLogger.info(`Retrieved metadata for ${fileMetadata.length} files from IDs`);
      }

      // Execute with the existing agent
      await agent.execute({
        "input": instructions,
        "maxSteps": 20,
        "files": fileMetadata
      });
      
      // Collect screenshots from agent
      if (this.activeSession && typeof agent.getScreenshots === 'function') {
        const agentScreenshots = agent.getScreenshots();
        sessionLogger.info(`Collected ${agentScreenshots.length} screenshots from agent`);
        
        if (agentScreenshots.length > 0) {
          this.screenshotsService.addScreenshots(sessionId, agentScreenshots);
        }
      }
      
      // Update session status on completion
      if (this.activeSession) {
        this.activeSession.status = StatusEnum.END;
        this.activeSession.timestamps.updated = Date.now();
        this.activeSession.timestamps.completed = Date.now();

        // Auto-save the recording
        try {
          const screenshots = this.screenshotsService.getSessionScreenshots(sessionId);
          if (screenshots && screenshots.length > 0) {
            sessionLogger.info(`Session completed successfully. Auto-saving recording for session ${sessionId}`);
            const recording = await this.screenshotsService.saveSessionRecording(
              sessionId,
              this.activeSession.operatorType
            );
            sessionLogger.info(`Auto-saved recording ${recording.id} for completed session ${sessionId}`);
          } else {
            sessionLogger.info(`Session completed but no screenshots to save for session ${sessionId}`);
          }
        } catch (error) {
          sessionLogger.error(`Error auto-saving recording for completed session ${sessionId}:`, error);
        }
      }
    } catch(error) {
      // Don't treat abort errors as real errors
      if (error.name === 'AbortError') {
        sessionLogger.info(`Session execution was aborted as expected`);
        return sessionId;
      }
      
      // Log the full error with stack trace for debugging
      sessionLogger.error(error);
      
      // Try to collect any screenshots that might have been captured before the error
      if (this.activeSession && typeof agent.getScreenshots === 'function') {
        const agentScreenshots = agent.getScreenshots();
        sessionLogger.info(`Collected ${agentScreenshots.length} screenshots from agent (after error)`);
        
        if (agentScreenshots.length > 0) {
          this.screenshotsService.addScreenshots(sessionId, agentScreenshots);
        }
      }
      
      if (this.activeSession) {
        this.activeSession.status = StatusEnum.ERROR;

        // Parse and enhance error message
        let errorMsg = error.message;
        if (errorMsg.includes("did not match schema")) {
          errorMsg = `Schema validation error: ${errorMsg}. Check agent implementation in agents/reAct.ts`;
        }

        this.activeSession.errorMsg = errorMsg;
        this.activeSession.timestamps.updated = Date.now();
        this.emitSessionUpdate({
          status: StatusEnum.ERROR,
          errorMsg: errorMsg,
          conversations: this.activeSession.conversations
        });
      }
    }

    return sessionId;
  }

  /**
   * Get the current active session
   */
  public getSession(): SessionResponseDto {
    if (!this.activeSession) {
      throw new Error('No active session found');
    }

    return {
      sessionId: this.activeSession.id,
      status: this.activeSession.status,
      operator: this.activeSession.operatorType,
      conversations: this.activeSession.conversations,
      errorMsg: this.activeSession.errorMsg,
    };
  }

  /**
   * Cancel the current session execution
   */
  public cancelSession(): boolean {
    if (!this.activeSession) {
      throw new Error('No active session found');
    }

    // If the session is running, use the abort controller
    if (this.activeSession.status === StatusEnum.RUNNING && this.activeSession.agent?.abortController) {
      try {
        this.activeSession.agent.abortController.abort();
        this.activeSession.agent.abortController = new AbortController();
      } catch (error) {
        sessionLogger.warn(`Error aborting execution: ${error.message}`);
      }
    }

    // Update status
    this.activeSession.status = StatusEnum.USER_STOPPED;
    this.activeSession.timestamps.updated = Date.now();

    // Emit status update
    this.emitSessionUpdate({
      status: StatusEnum.USER_STOPPED,
      conversations: this.activeSession.conversations
    });

    sessionLogger.info(`Session cancelled: ${this.activeSession.id}`);
    return true;
  }

  /**
   * Delete the active session
   */
  public async deleteSession(): Promise<boolean> {
    if (!this.activeSession) {
      throw new Error('No active session found');
    }
    
    const sessionId = this.activeSession.id;
    
    // Emit a status update about the deletion
    this.emitSessionUpdate({
      status: StatusEnum.USER_STOPPED,
      conversations: []
    });
    
    // Log the deletion request
    sessionLogger.info(`Deleting session: ${sessionId}`);
    
    // Use the internal closeSession method to clean up resources
    const result = await this.closeSession();
    
    if (result) {
      sessionLogger.info(`Session ${sessionId} deleted successfully`);
    } else {
      sessionLogger.error(`Failed to delete session ${sessionId}`);
    }
    
    return result;
  }

  /**
   * Take a screenshot for the active session
   */
  public async takeScreenshot(): Promise<string> {
    if (!this.activeSession) {
      throw new Error('No active session found');
    }

    try {
      const operator = this.activeSession.operator;
      const screenshot = await operator.screenshot();
      return screenshot.base64;
    } catch (error: any) {
      sessionLogger.error(`Failed to take screenshot for active session:`, error);
      throw new Error(`Failed to take screenshot: ${error.message}`);
    }
  }

  /**
   * Close the active session and clean up resources
   * This is an internal method used by other methods
   */
  private async closeSession(): Promise<boolean> {
    if (!this.activeSession) {
      return false;
    }

    try {
      const sessionId = this.activeSession.id;

      // If the session is running, attempt to abort
      if (
        this.activeSession.status === StatusEnum.RUNNING && 
        this.activeSession.agent?.abortController
      ) {
        try {
          this.activeSession.agent.abortController.abort();
        } catch (error) {
          sessionLogger.warn(`Error aborting execution during closeSession: ${error.message}`);
        }
      }

      // Close operator
      await this.operatorFactoryService.closeOperator(
        this.activeSession.operator,
        this.activeSession.operatorType,
      );

      // Log the closure
      sessionLogger.info(`Session closed: ${sessionId}`);

      // Clear screenshots in the dedicated service
      this.screenshotsService.clearSessionScreenshots(sessionId);

      // Clear the session references
      this.activeSession = null;

      return true;
    } catch (error) {
      sessionLogger.error(`Error closing active session:`, error);
      return false;
    }
  }

  /**
   * Get screenshots from the active session
   */
  public getSessionScreenshots(): ScreenshotDto[] {
    if (!this.activeSession) {
      throw new Error('No active session found');
    }
    
    return this.screenshotsService.getSessionScreenshots(this.activeSession.id);
  }
  
  /**
   * Save the current session as a video recording
   */
  public async saveSessionRecording(): Promise<VideoRecordingDto> {
    if (!this.activeSession) {
      throw new Error('No active session found');
    }
    
    return this.screenshotsService.saveSessionRecording(
      this.activeSession.id, 
      this.activeSession.operatorType
    );
  }
  
  /**
   * Get video data from the current session
   */
  public async getSessionVideoData() {
    if (!this.activeSession) {
      throw new Error('No active session found');
    }
    
    return this.screenshotsService.getSessionVideoData(this.activeSession.id);
  }
  
  /**
   * Automatic cleanup for the active session if it's been inactive
   */
  @Interval(15 * 60 * 1000)
  public async cleanupSession(maxAgeMs: number = 3600000): Promise<void> {
    sessionLogger.info('Running session cleanup check...');
    
    if (!this.activeSession) {
      return;
    }
    
    const now = Date.now();
    
    // Check if session is completed/error/cancelled and old
    if (
      (this.activeSession.status === StatusEnum.END ||
        this.activeSession.status === StatusEnum.ERROR ||
        this.activeSession.status === StatusEnum.USER_STOPPED) &&
      now - this.activeSession.timestamps.updated > maxAgeMs
    ) {
      await this.closeSession();
      sessionLogger.info('Inactive session cleaned up');
    }
  }
}