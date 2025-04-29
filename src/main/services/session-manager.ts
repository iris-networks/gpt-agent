/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { EventEmitter } from 'events';
import { GUIAgent } from '@ui-tars/sdk';
import { UITarsModelVersion, StatusEnum } from '@ui-tars/shared/types';
// import { UTIOService } from '@ui-tars/utio';
import { SessionStatus, OperatorType } from '../../shared/constants';
import {
  SessionData,
  CreateSessionRequest,
  SessionResponse,
} from '../../shared/types';
import { OperatorFactory } from './operator-factory';
import { ConfigService } from './config';
import { sessionLogger } from '../utils/logger';

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

/**
 * Session Manager Service
 * Manages all automation sessions
 */
export class SessionManager {
  private static instance: SessionManager;
  private sessions: Map<string, SessionData>;
  private configService: ConfigService;

  private constructor() {
    this.sessions = new Map();
    this.configService = ConfigService.getInstance();
    sessionLogger.info('Session Manager initialized');
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
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
      const operator = await OperatorFactory.createOperator(operatorType);

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
          session.status = this.mapStatusEnum(status);
          session.timestamps.updated = Date.now();
        }

        // Emit event
        eventEmitter.emit('update', { status, conversations });
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
        systemPrompt: `You are an AI assistant that helps users with ${operatorType} automation tasks.`,
        signal: abortController.signal,
        operator: operator,
        onData: handleData,
        onError: ({ error }) => {
          sessionLogger.error(`Error in session ${sessionId}:`, error);
          if (this.sessions.has(sessionId)) {
            const session = this.sessions.get(sessionId)!;
            session.status = SessionStatus.ERROR;
            session.errorMsg = error.error;
            session.timestamps.updated = Date.now();
            eventEmitter.emit('error', { error: error.error });
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
      // UTIOService.getInstance().sendInstruction(instructions);

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
          }
        })
        .finally(() => {
          if (this.sessions.has(sessionId)) {
            const session = this.sessions.get(sessionId)!;
            if (
              session.status !== SessionStatus.ERROR &&
              session.status !== SessionStatus.CANCELLED
            ) {
              session.status = SessionStatus.COMPLETED;
              session.timestamps.completed = Date.now();
              session.timestamps.updated = Date.now();
            }
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
      await OperatorFactory.closeOperator(
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
   * Clean up old sessions
   */
  public async cleanupSessions(maxAgeMs: number = 3600000): Promise<void> {
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

  /**
   * Map StatusEnum to SessionStatus
   */
  private mapStatusEnum(status: StatusEnum): SessionStatus {
    switch (status) {
      case StatusEnum.INIT:
        return SessionStatus.INITIALIZING;
      case StatusEnum.RUNNING:
        return SessionStatus.RUNNING;
      case StatusEnum.PAUSE:
        return SessionStatus.PAUSED;
      case StatusEnum.END:
        return SessionStatus.COMPLETED;
      case StatusEnum.ERROR:
        return SessionStatus.ERROR;
      case StatusEnum.USER_STOPPED:
        return SessionStatus.CANCELLED;
      default:
        return SessionStatus.RUNNING;
    }
  }
}
