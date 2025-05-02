/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { Injectable, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { EventEmitter } from 'events';
import { GUIAgent } from '@ui-tars/sdk';
import { UITarsModelVersion, StatusEnum } from '@ui-tars/shared/types';
import { OperatorType, SessionStatus } from '../../../shared/constants';
import {
  SessionData,
  CreateSessionRequest,
  SessionResponse,
} from '../../../shared/types';
import { OperatorFactoryService } from '../../operators/services/operator-factory.service';
import { ConfigService } from '../../config/config.service';
import { sessionLogger } from '../../../common/services/logger.service';
import { Interval } from '@nestjs/schedule';
import { ModuleRef } from '@nestjs/core';
import { SessionsGateway } from '../gateways/sessions.gateway';

/**
 * Gets the UI-TARS model version from provider string
 */
const getModelVersion = (provider: string): UITarsModelVersion => {
  switch (provider) {
    case 'ui_tars_1_5':
      return UITarsModelVersion.V1_5;
    case 'ui_tars_1_0':
      return UITarsModelVersion.V1_0;
    case 'doubao_1_5':
      return UITarsModelVersion.DOUBAO_1_5_15B;
    default:
      return UITarsModelVersion.V1_5;
  }
};

@Injectable()
export class SessionManagerService implements OnModuleInit {
  private sessions: Map<string, SessionData>;
  // Gateway reference already provided via constructor injection

  constructor(
    private readonly configService: ConfigService,
    private readonly moduleRef: ModuleRef,
    @Inject(forwardRef(() => OperatorFactoryService))
    private readonly operatorFactoryService: OperatorFactoryService,
    @Inject(forwardRef(() => SessionsGateway))
    private readonly sessionsGateway: SessionsGateway,
  ) {
    this.sessions = new Map();
    sessionLogger.info('Session Manager initialized');
  }

  async onModuleInit() {
    // Nothing specific needed on initialization
    sessionLogger.info('Session Manager initialized');
  }

  /**
   * Emits an event to a session via WebSocket
   */
  public emitToSession(sessionId: string, event: string, data: any): void {
    try {
      if (this.sessionsGateway) {
        this.sessionsGateway.emitToSession(sessionId, event, data);
      } else {
        sessionLogger.warn(`Skipping emission to session ${sessionId} - gateway not available`);
      }
    } catch (error) {
      sessionLogger.error(`Failed to emit event to session ${sessionId}:`, error);
    }
  }

  /**
   * Create a new session
   */
  public async createSession(request: CreateSessionRequest): Promise<string> {
    const { instructions } = request;
    if (!instructions) {
      throw new Error('Instructions are required');
    }

    // Generate session ID
    const sessionId = Date.now().toString();

    // Get configuration
    const defaultConfig = this.configService.getConfig();
    const sessionConfig = { ...defaultConfig, ...(request.config || {}) };

    // Determine operator type
    const operatorType = request.operator || defaultConfig.defaultOperator;

    try {
      // Create operator
      const operator = await this.operatorFactoryService.createOperator(operatorType);

      // Setup data handler
      const conversations: any[] = [];
      const eventEmitter = new EventEmitter();

      const handleData = ({ data }: any) => {
        const { status, conversations: newConversations } = data;

        // Add new conversations
        if (newConversations && newConversations.length > 0) {
          conversations.push(...newConversations);
        }

        // Update session status
        if (this.sessions.has(sessionId)) {
          const session = this.sessions.get(sessionId)!;
          session.status = status;
          session.timestamps.updated = Date.now();
        }

        // Emit event through EventEmitter
        eventEmitter.emit('update', { status, conversations });
        
        // Also emit through WebSocket
        this.emitToSession(sessionId, 'sessionUpdate', { 
          sessionId, 
          status, 
          conversations 
        });
      };

      // Create abort controller
      const abortController = new AbortController();

      // Create GUI agent
      const guiAgent = new GUIAgent({
        model: {
          baseURL: sessionConfig.vlmBaseUrl,
          apiKey: sessionConfig.vlmApiKey,
          model: sessionConfig.vlmModelName,
        },
        signal: abortController.signal,
        operator: operator,
        onData: handleData,
        onError: ({ error }) => {
          sessionLogger.error(`Error in session ${sessionId}:`, String(error));
          if (this.sessions.has(sessionId)) {
            const session = this.sessions.get(sessionId)!;
            session.status = SessionStatus.ERROR;
            session.errorMsg = error.error;
            session.timestamps.updated = Date.now();
            eventEmitter.emit('error', { error: error.error });
            
            // Also emit through WebSocket
            this.emitToSession(sessionId, 'sessionError', { 
              sessionId, 
              error: error.error 
            });
          }
        },
        retry: {
          model: { maxRetries: 3 },
          screenshot: { maxRetries: 5 },
          execute: { maxRetries: 1 },
        },
        maxLoopCount: sessionConfig.maxLoopCount,
        loopIntervalInMs: sessionConfig.loopIntervalInMs,
        uiTarsVersion: getModelVersion(sessionConfig.vlmProvider),
      });

      // Store session
      this.sessions.set(sessionId, {
        id: sessionId,
        agent: guiAgent,
        operator,
        abortController,
        conversations,
        status: SessionStatus.INITIALIZING,
        instructions,
        operatorType,
        eventEmitter,
        timestamps: {
          created: Date.now(),
          updated: Date.now(),
        },
      });

      // Start the agent in the background
      guiAgent
        .run(instructions)
        .catch((error) => {
          sessionLogger.error(
            `Run agent error in session ${sessionId}:`,
            error,
          );
          if (this.sessions.has(sessionId)) {
            const session = this.sessions.get(sessionId)!;
            session.status = SessionStatus.ERROR;
            session.errorMsg = error.message;
            session.timestamps.updated = Date.now();
            
            // Emit through WebSocket
            this.emitToSession(sessionId, 'sessionError', { 
              sessionId, 
              error: error.message 
            });
          }
        })
        .finally(() => {
          if (this.sessions.has(sessionId)) {
            const session = this.sessions.get(sessionId)!;
            
            // Only set to completed if not already in error or cancelled state
            if (session.status !== SessionStatus.ERROR && session.status !== SessionStatus.CANCELLED) {
              session.status = SessionStatus.COMPLETED;
            }
            
            session.timestamps.completed = Date.now();
            session.timestamps.updated = Date.now();
            
            // Emit through WebSocket - send the current status
            this.emitToSession(sessionId, 'sessionUpdate', { 
              sessionId, 
              status: session.status,
              conversations: session.conversations
            });
            
            // Log completion
            sessionLogger.info(`Session ${sessionId} finalized with status: ${session.status}`);
          }
        });

      sessionLogger.info(
        `Session created: ${sessionId}, operator: ${operatorType}`,
      );
      return sessionId;
    } catch (error: any) {
      sessionLogger.error(`Failed to create session:`, error);
      throw new Error(`Failed to create session: ${error.message}`);
    }
  }

  /**
   * Get session information
   */
  public getSession(sessionId: string): SessionResponse {
    if (!this.sessions.has(sessionId)) {
      throw new Error('Session not found');
    }

    const session = this.sessions.get(sessionId)!;
    return {
      sessionId: session.id,
      status: session.status,
      operator: session.operatorType,
      conversations: session.conversations,
      errorMsg: session.errorMsg,
    };
  }

  /**
   * Cancel a session
   */
  public cancelSession(sessionId: string): boolean {
    if (!this.sessions.has(sessionId)) {
      throw new Error('Session not found');
    }

    const session = this.sessions.get(sessionId)!;
    session.abortController.abort();
    session.status = SessionStatus.CANCELLED;
    session.timestamps.updated = Date.now();
    
    // Emit through WebSocket
    this.emitToSession(sessionId, 'sessionUpdate', { 
      sessionId, 
      status: SessionStatus.CANCELLED,
      conversations: session.conversations
    });

    sessionLogger.info(`Session cancelled: ${sessionId}`);
    return true;
  }

  /**
   * Take a screenshot for a session
   */
  public async takeScreenshot(sessionId: string): Promise<string> {
    if (!this.sessions.has(sessionId)) {
      throw new Error('Session not found');
    }

    try {
      const session = this.sessions.get(sessionId)!;
      const operator = session.agent.operator;
      const screenshot = await operator.takeScreenshot();
      return screenshot.toString('base64');
    } catch (error: any) {
      sessionLogger.error(
        `Failed to take screenshot for session ${sessionId}:`,
        error,
      );
      throw new Error(`Failed to take screenshot: ${error.message}`);
    }
  }

  /**
   * Close a session and clean up resources
   */
  public async closeSession(sessionId: string): Promise<boolean> {
    if (!this.sessions.has(sessionId)) {
      return false;
    }

    const session = this.sessions.get(sessionId)!;

    try {
      // Cancel if not already done
      if (
        session.status !== SessionStatus.COMPLETED &&
        session.status !== SessionStatus.ERROR &&
        session.status !== SessionStatus.CANCELLED
      ) {
        session.abortController.abort();
      }

      // Close operator
      await this.operatorFactoryService.closeOperator(
        session.operator,
        session.operatorType,
      );

      // Remove session
      this.sessions.delete(sessionId);
      sessionLogger.info(`Session closed and removed: ${sessionId}`);
      return true;
    } catch (error) {
      sessionLogger.error(`Error closing session ${sessionId}:`, error);
      return false;
    }
  }

  /**
   * Clean up old sessions - runs every 15 minutes via interval
   */
  @Interval(15 * 60 * 1000)
  public async cleanupSessions(maxAgeMs: number = 3600000): Promise<void> {
    sessionLogger.info('Running session cleanup...');
    const now = Date.now();

    for (const [sessionId, session] of this.sessions.entries()) {
      // Check if session is completed/error/cancelled and old
      if (
        (session.status === SessionStatus.COMPLETED ||
          session.status === SessionStatus.ERROR ||
          session.status === SessionStatus.CANCELLED) &&
        now - session.timestamps.updated > maxAgeMs
      ) {
        await this.closeSession(sessionId);
      }
    }
  }


}