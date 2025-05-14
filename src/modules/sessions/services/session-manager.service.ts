/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { UITarsModelVersion } from '@ui-tars/shared/types';
import { SessionStatus } from '../../../shared/constants';
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

@Injectable()
export class SessionManagerService implements OnModuleInit {
  // Single active session data
  private activeSession: SessionDataDto | null = null;
  private abortController: AbortController = new AbortController();

  constructor(
    private readonly configService: ConfigService,
    private readonly operatorFactoryService: OperatorFactoryService,
    private readonly sessionEvents: SessionEventsService,
    private readonly screenshotsService: SessionScreenshotsService,
    private readonly fileUploadService: FileUploadService
  ) {
    sessionLogger.info('Session Manager initialized');
  }

  /**
   * Convert fileIds to full file metadata objects
   * @param fileIds Array of file IDs
   * @returns Array of file metadata objects
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

  async onModuleInit() {
    // Nothing specific needed on initialization
    sessionLogger.info('Session Manager initialized');
  }

  /**
   * Emits a session update event using the event service
   */
  private emitSessionUpdate(data: {
    status: SessionStatus;
    conversations?: Array<{
      role: 'user' | 'assistant' | 'system';
      content: string;
      timestamp?: number;
    }>;
    errorMsg?: string;
  }): void {
    if (!this.activeSession.id) {
      sessionLogger.warn(`Skipping update emission - no active session`);
      return;
    }
    
    // Emit through event service with proper typing
    this.sessionEvents.emitUpdate(data, this.activeSession.id);
  }

  /**
   * Create or interrupt a session
   * If instructions are provided, creates a new session or interrupts and updates the existing one
   * If only abortController is provided, simply interrupts the current execution
   */
  public async createSession(request: CreateSessionRequestDto) {
    // Interrupt any ongoing execution if there's an active session
    if (this.activeSession) {
      sessionLogger.info('Interrupting current session execution');
      this.abortController.abort();
    }

    // Handle interruption without new instructions
    if (!request.instructions) {
      if (this.activeSession) {
        // Update status
        this.activeSession.status = SessionStatus.PAUSED;
        this.activeSession.timestamps.updated = Date.now();
        
        // Emit typed update event
        this.emitSessionUpdate({ 
          status: SessionStatus.PAUSED,
          conversations: this.activeSession.conversations
        });
        
        return this.activeSession.id;
      } else {
        throw new Error('No active session to interrupt');
      }
    }

    // Otherwise, we need instructions
    const { instructions } = request;
    if (!instructions) {
      throw new Error('Instructions are required for new sessions');
    }

    // Check if we should keep the existing session or create a new one
    let isNewSession = true;
    let sessionId = Date.now().toString();
    
    if (this.activeSession) {
      // If session is in a terminal state, create a new one
      // Otherwise, reuse the existing session
      if (
        this.activeSession.status === SessionStatus.COMPLETED ||
        this.activeSession.status === SessionStatus.ERROR ||
        this.activeSession.status === SessionStatus.CANCELLED
      ) {
        // Clean up the old session
        await this.closeSession();
      } else {
        // Reuse the existing session
        isNewSession = false;
        sessionId = this.activeSession.id;
      }
    }
    
    // Get configuration
    const defaultConfig = this.configService.getConfig();
    const sessionConfig = { ...defaultConfig, ...(request.config || {}) };

    // Determine operator type
    const operatorType = request.operator || defaultConfig.defaultOperator;
    
    // Create a new operator if creating a new session
    // or if the operator type has changed
    let operator = this.activeSession?.operator;
    
    if (isNewSession || (this.activeSession && this.activeSession.operatorType !== operatorType)) {
      // Close existing operator if needed
      if (this.activeSession?.operator) {
        await this.operatorFactoryService.closeOperator(
          this.activeSession.operator,
          this.activeSession.operatorType
        );
      }
      
      // Create new operator
      operator = await this.operatorFactoryService.createOperator(operatorType);
    }

    
    // Create the GUI agent tool
    // const guiAgentTool = createGuiAgentTool({
    //   "abortController": this.abortController,
    //   "operator": operator,
    //   "timeout": 600_000,
    //   "config": {
    //     "apiKey": sessionConfig.vlmApiKey,
    //     "baseURL": sessionConfig.vlmBaseUrl,
    //     "model": sessionConfig.vlmModelName,
    //   }
    // });

    // Create or update the active session
    this.activeSession = {
      id: sessionId,
      agent: null, // Will set this to reAct agent instead of guiAgentTool
      operator,
      conversations: isNewSession ? [] : (this.activeSession?.conversations || []),
      status: SessionStatus.RUNNING,
      instructions,
      operatorType,
      timestamps: {
        created: isNewSession ? Date.now() : (this.activeSession?.timestamps.created || Date.now()),
        updated: Date.now()
      }
    };
    
    // Initialize screenshots for this session in the dedicated service
    if (isNewSession) {
      this.screenshotsService.initSessionScreenshots(sessionId);
    }
    
    this.activeSession.id = sessionId;

    const agent = new ReactAgent(operator)
    // Store the agent reference in the session data
    this.activeSession.agent = agent;
    
    try {
      // Handle file metadata
      let fileMetadata = request.files || [];

      // If fileIds are provided but not complete metadata, fetch the metadata
      if ((!fileMetadata || fileMetadata.length === 0) && request.fileIds && request.fileIds.length > 0) {
        fileMetadata = await this.getFileMetadata(request.fileIds);
        sessionLogger.info(`Retrieved metadata for ${fileMetadata.length} files from IDs`);
      }

      await agent.execute({
        "input": request.instructions,
        "maxSteps": 10,
        "files": fileMetadata
      });
      
      // Collect screenshots from agent
      if (this.activeSession && typeof agent.getScreenshots === 'function') {
        const agentScreenshots = agent.getScreenshots();
        sessionLogger.info(`Collected ${agentScreenshots.length} screenshots from agent`);
        
        // Add screenshots to the dedicated service
        if (agentScreenshots.length > 0) {
          this.screenshotsService.addScreenshots(this.activeSession.id, agentScreenshots);
        }
      }
      
      // this is the final result and should be persisted on the ui
      if (this.activeSession) {
        this.activeSession.status = SessionStatus.COMPLETED;
        this.activeSession.timestamps.updated = Date.now();
        this.activeSession.timestamps.completed = Date.now();
        
        // Auto-save the recording when session completes successfully
        try {
          // Only save if there are screenshots
          const screenshots = this.screenshotsService.getSessionScreenshots(this.activeSession.id);
          if (screenshots && screenshots.length > 0) {
            sessionLogger.info(`Session completed successfully. Auto-saving recording for session ${this.activeSession.id} with ${screenshots.length} screenshots.`);
            const recording = await this.screenshotsService.saveSessionRecording(this.activeSession.id, this.activeSession.operatorType);
            sessionLogger.info(`Auto-saved recording ${recording.id} for completed session ${this.activeSession.id}`);
          } else {
            sessionLogger.info(`Session completed but no screenshots to save for session ${this.activeSession.id}`);
          }
        } catch (error) {
          sessionLogger.error(`Error auto-saving recording for completed session ${this.activeSession.id}:`, error);
        }
        
        this.emitSessionUpdate({ 
          status: SessionStatus.COMPLETED,
          conversations: this.activeSession.conversations
        });
      }
    } catch(error) {     
      // Log the full error with stack trace for debugging
      sessionLogger.error(error);
      
      // Try to collect any screenshots that might have been captured before the error
      if (this.activeSession && typeof agent.getScreenshots === 'function') {
        const agentScreenshots = agent.getScreenshots();
        sessionLogger.info(`Collected ${agentScreenshots.length} screenshots from agent (after error)`);
        
        // Add screenshots to the dedicated service
        if (agentScreenshots.length > 0) {
          this.screenshotsService.addScreenshots(this.activeSession.id, agentScreenshots);
        }
      }
      
      if (this.activeSession) {
        this.activeSession.status = SessionStatus.ERROR;
        
        // Parse and enhance error message
        let errorMsg = error.message;
        
        // Handle specific known errors
        if (errorMsg.includes("did not match schema")) {
          // This error comes from AI SDK's generateObject schema validation
          errorMsg = `Schema validation error: ${errorMsg}. Check agent implementation in agents/reAct.ts`;
        }
        
        this.activeSession.errorMsg = errorMsg;
        this.activeSession.timestamps.updated = Date.now();
        this.emitSessionUpdate({ 
          status: SessionStatus.ERROR,
          errorMsg: errorMsg,
          conversations: this.activeSession.conversations
        });
      }
    }

    return sessionId;
  }

  /**
   * Get active session information
   */
  public getSession(sessionId?: string): SessionResponseDto {
    if (!this.activeSession) {
      throw new Error('No active session found');
    }

    // Ignore the session ID parameter, always return the active session
    return {
      sessionId: this.activeSession.id,
      status: this.activeSession.status,
      operator: this.activeSession.operatorType,
      conversations: this.activeSession.conversations,
      errorMsg: this.activeSession.errorMsg,
    };
  }

  /**
   * Cancel the active session
   */
  public cancelSession(sessionId?: string): boolean {
    if (!this.activeSession) {
      throw new Error('No active session found');
    }

    // Only abort if the session is in a non-terminal state
    if (
      this.activeSession.status !== SessionStatus.COMPLETED &&
      this.activeSession.status !== SessionStatus.ERROR &&
      this.activeSession.status !== SessionStatus.CANCELLED
    ) {
      // Abort the current execution
      this.abortController.abort();
    }
    
    // Update status
    this.activeSession.status = SessionStatus.CANCELLED;
    this.activeSession.timestamps.updated = Date.now();
    
    // Emit typed update event
    this.emitSessionUpdate({ 
      status: SessionStatus.CANCELLED,
      conversations: this.activeSession.conversations
    });

    sessionLogger.info(`Session cancelled: ${this.activeSession.id}`);
    return true;
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
      sessionLogger.error(
        `Failed to take screenshot for active session:`,
        error,
      );
      throw new Error(`Failed to take screenshot: ${error.message}`);
    }
  }

  /**
   * Close the active session and clean up resources
   */
  public async closeSession(): Promise<boolean> {
    if (!this.activeSession) {
      return false;
    }

    try {
      const sessionId = this.activeSession.id;
      
      // Cancel if not already done
      if (
        this.activeSession.status !== SessionStatus.COMPLETED &&
        this.activeSession.status !== SessionStatus.ERROR &&
        this.activeSession.status !== SessionStatus.CANCELLED
      ) {
        this.abortController.abort();
      }

      // Close operator
      await this.operatorFactoryService.closeOperator(
        this.activeSession.operator,
        this.activeSession.operatorType,
      );

      // Log the closure
      sessionLogger.info(`Session closed: ${sessionId}`);
      
      // Clear screenshots in the dedicated service
      if (sessionId) {
        this.screenshotsService.clearSessionScreenshots(sessionId);
      }
      
      // Clear the session references
      this.activeSession = null;
      this.activeSession.id = null;
      
      return true;
    } catch (error) {
      sessionLogger.error(`Error closing active session:`, error);
      return false;
    }
  }

  /**
   * Get screenshots from the active session
   * @returns Array of screenshots with associated thoughts
   */
  public getSessionScreenshots(): ScreenshotDto[] {
    if (!this.activeSession) {
      throw new Error('No active session found');
    }
    
    return this.screenshotsService.getSessionScreenshots(this.activeSession.id);
  }
  
  /**
   * Save the current session as a video recording
   * @returns VideoRecording metadata
   */
  public async saveSessionRecording(): Promise<VideoRecordingDto> {
    if (!this.activeSession) {
      throw new Error('No active session found');
    }
    
    // Delegate to the screenshots service, passing the operator type
    return this.screenshotsService.saveSessionRecording(
      this.activeSession.id, 
      this.activeSession.operatorType
    );
  }
  
  /**
   * Get video data from the current session
   * @returns Object with frames and captions
   */
  public async getSessionVideoData() {
    if (!this.activeSession) {
      throw new Error('No active session found');
    }
    
    // Delegate to the screenshots service
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
      (this.activeSession.status === SessionStatus.COMPLETED ||
        this.activeSession.status === SessionStatus.ERROR ||
        this.activeSession.status === SessionStatus.CANCELLED) &&
      now - this.activeSession.timestamps.updated > maxAgeMs
    ) {
      await this.closeSession();
      sessionLogger.info('Inactive session cleaned up');
    }
  }
}