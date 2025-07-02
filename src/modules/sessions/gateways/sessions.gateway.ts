/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { CreateSessionDto } from '../dto/sessions.dto';
import { SessionManagerService } from '../services/session-manager.service';
import { SessionEventsService } from '../services/session-events.service';
import { apiLogger } from '../../../common/services/logger.service';
import { SocketEventDto } from '@app/shared/dto';
// Human layer functionality removed

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SessionsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer()
  server: Server;

  // Single static connection - no need to track client IDs
  private static isInitialized = false;
  private static eventListenerBound = false;

  constructor(
    private readonly sessionManagerService: SessionManagerService,
    private readonly sessionEvents: SessionEventsService,
  ) {}

  afterInit() {
    apiLogger.info('WebSocket Sessions Gateway Initialized');
  }

  /**
   * Initialize event listeners when module is ready
   */
  onModuleInit() {
    if (SessionsGateway.eventListenerBound) {
      apiLogger.info('Event listeners already initialized, skipping');
      return;
    }

    // Register event listener for session status updates
    this.sessionEvents.on('sessionStatus', (data: SocketEventDto) => {
      apiLogger.debug(`Broadcasting session status update to all clients`);
      this.server.emit('sessionStatus', data);
    });

    SessionsGateway.eventListenerBound = true;
    apiLogger.info('WebSocket event listeners initialized with broadcast approach');
  }

  handleConnection(client: Socket) {
    apiLogger.info(`Client connected: ${client.id}`);
    SessionsGateway.isInitialized = true;
  }

  handleDisconnect(client: Socket) {
    apiLogger.info(`Client disconnected: ${client.id}`);
  }

  /**
   * Create a new session, replacing any existing one
   */
  @SubscribeMessage('createSession')
  async handleCreateSession(client: Socket, payload: CreateSessionDto) {
    try {
      // Log file information if provided
      if (payload.files && payload.files.length > 0) {
        apiLogger.info(`Creating session with ${payload.files.length} attached files with metadata: ${payload.files.map(f => f.fileName).join(', ')}`);
      } else if (payload.fileIds && payload.fileIds.length > 0) {
        apiLogger.info(`Creating session with ${payload.fileIds.length} attached files: ${payload.fileIds.join(', ')}`);
      }

      // Always creates a fresh session, replacing any existing one
      const sessionId = await this.sessionManagerService.createSession(payload);
      apiLogger.info(`Session ${sessionId} created via WebSocket by client ${client.id}`);

      // Get the session data
      const session = this.sessionManagerService.getSession();

      return {
        sessionId,
        success: true,
        status: session.status,
        files: payload.files,
        fileIds: payload.fileIds
      };
    } catch (error) {
      apiLogger.error('Failed to create session via WebSocket:', error);
      return {
        success: false,
        error: error.message || 'Failed to create session'
      };
    }
  }
  
  /**
   * Update an existing session with new instructions
   */
  @SubscribeMessage('updateSession')
  async handleUpdateSession(client: Socket, payload: CreateSessionDto) {
    try {
      // Log file information if provided
      if (payload.files && payload.files.length > 0) {
        apiLogger.info(`Updating session with ${payload.files.length} attached files with metadata: ${payload.files.map(f => f.fileName).join(', ')}`);
      } else if (payload.fileIds && payload.fileIds.length > 0) {
        apiLogger.info(`Updating session with ${payload.fileIds.length} attached files: ${payload.fileIds.join(', ')}`);
      }

      // Updates existing session, reusing the agent instance
      const sessionId = await this.sessionManagerService.updateSession(payload);
      apiLogger.info(`Session ${sessionId} updated via WebSocket by client ${client.id}`);

      // Get the session data
      const session = this.sessionManagerService.getSession();

      return {
        sessionId,
        success: true,
        status: session.status,
        files: payload.files,
        fileIds: payload.fileIds
      };
    } catch (error) {
      apiLogger.error('Failed to update session via WebSocket:', error);
      return {
        success: false,
        error: error.message || 'Failed to update session'
      };
    }
  }

  /**
   * Join the current active session
   */
  @SubscribeMessage('joinSession')
  handleJoinSession(client: Socket) {
    try {
      // Always get the active session (sessionId parameter is ignored)
      const session = this.sessionManagerService.getSession();
      apiLogger.info(`Client ${client.id} joined active session, status: ${session.status}`);

      return {
        success: true,
        session
      };
    } catch (error) {
      apiLogger.error(`Failed to join session:`, error);
      return {
        success: false,
        error: error.message || 'Failed to join session'
      };
    }
  }

  /**
   * Leave the current session (client disconnect)
   */
  @SubscribeMessage('leaveSession')
  handleLeaveSession(client: Socket) {
    apiLogger.info(`Client ${client.id} left session`);
    return { success: true };
  }

  /**
   * Cancel the current session execution
   */
  @SubscribeMessage('cancelSession')
  handleCancelSession(client: Socket) {
    try {
      const result = this.sessionManagerService.cancelSession();
      apiLogger.info(`Session cancelled by client ${client.id}`);
      return { success: result };
    } catch (error) {
      apiLogger.error(`Failed to cancel session:`, error);
      return {
        success: false,
        error: error.message || 'Failed to cancel session'
      };
    }
  }

  /**
   * Delete the current session
   */
  @SubscribeMessage('deleteSession')
  async handleDeleteSession(client: Socket) {
    try {
      // Get session ID before deletion for logging
      const session = this.sessionManagerService.getSession();
      const sessionId = session.sessionId;

      // Delete the session
      const result = await this.sessionManagerService.deleteSession();

      apiLogger.info(`Session ${sessionId} deleted by client ${client.id}`);
      return {
        success: result,
        message: `Session ${sessionId} deleted successfully`
      };
    } catch (error) {
      apiLogger.error(`Failed to delete session:`, error);
      return {
        success: false,
        error: error.message || 'Failed to delete session'
      };
    }
  }

  // Human layer request handlers removed

  /**
   * Send file attachments to the current session
   */
  @SubscribeMessage('sendFileAttachments')
  async handleSendFileAttachments(client: Socket, payload: { fileIds: any[] }) {
    try {
      if (!payload || !payload.fileIds || !Array.isArray(payload.fileIds)) {
        return {
          success: false,
          error: 'Invalid payload: fileIds must be an array'
        };
      }

      // Check if we received simple file IDs or full metadata objects
      const isMetadataPayload = typeof payload.fileIds[0] === 'object' && payload.fileIds[0].fileId;

      // Extract IDs for logging
      const ids = isMetadataPayload
        ? payload.fileIds.map(f => f.fileId)
        : payload.fileIds;

      apiLogger.info(`Received file attachments from client ${client.id}: ${ids.join(', ')}`);

      // Get the current session
      const session = this.sessionManagerService.getSession();

      // Emit a session status update
      this.sessionEvents.emitStatus(
        `Received ${payload.fileIds.length} file attachments`,
        session.status,
        session.sessionId,
        {
          files: isMetadataPayload ? payload.fileIds : undefined,
          fileIds: isMetadataPayload ? ids : payload.fileIds
        }
      );

      return {
        success: true,
        message: `Received ${payload.fileIds.length} ${isMetadataPayload ? 'files with metadata' : 'file IDs'}`
      };
    } catch (error) {
      apiLogger.error(`Failed to process file attachments:`, error);
      return {
        success: false,
        error: error.message || 'Failed to process file attachments'
      };
    }
  }
}