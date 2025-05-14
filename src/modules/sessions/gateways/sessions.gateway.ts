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
import { SessionEventName, SessionUpdateEvent, SessionErrorEvent } from '../interfaces/session-events.interface';
import { apiLogger } from '../../../common/services/logger.service';

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

  // Track the single active client
  private activeClientId: string | null = null;

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
    // Set up strongly typed listeners for session events to forward to websocket clients
    this.sessionEvents.on(SessionEventName.UPDATE, (data: SessionUpdateEvent) => {
      this.emitToSession(SessionEventName.UPDATE, data);
    });
    
    this.sessionEvents.on(SessionEventName.ERROR, (data: SessionErrorEvent) => {
      this.emitToSession(SessionEventName.ERROR, data);
    });
    
    apiLogger.info('WebSocket event listeners initialized with type safety');
  }

  handleConnection(client: Socket) {
    // Set as the active client, replacing any previous client
    this.activeClientId = client.id;
    apiLogger.info(`Client connected: ${client.id} (set as active client)`);
  }

  handleDisconnect(client: Socket) {
    // Clear active client if this was the active one
    if (this.activeClientId === client.id) {
      this.activeClientId = null;
      apiLogger.info(`Active client disconnected: ${client.id}`);
    } else {
      apiLogger.info(`Non-active client disconnected: ${client.id}`);
    }
  }

  @SubscribeMessage('createSession')
  async handleCreateSession(client: Socket, payload: CreateSessionDto) {
    try {
      // Make sure this is the active client
      this.activeClientId = client.id;

      // Log if file information is provided
      if (payload.files && payload.files.length > 0) {
        apiLogger.info(`Creating session with ${payload.files.length} attached files with metadata: ${payload.files.map(f => f.fileName).join(', ')}`);
      } else if (payload.fileIds && payload.fileIds.length > 0) {
        apiLogger.info(`Creating session with ${payload.fileIds.length} attached files: ${payload.fileIds.join(', ')}`);
      }

      const sessionId = await this.sessionManagerService.createSession(payload);
      apiLogger.info(`Session ${sessionId} created via WebSocket by client ${client.id}`);

      // Get the session data
      const session = this.sessionManagerService.getSession();

      return {
        sessionId,
        success: true,
        status: session.status,
        files: payload.files, // Return the file metadata in the response
        fileIds: payload.fileIds // Return the file IDs for backward compatibility
      };
    } catch (error) {
      apiLogger.error('Failed to create session via WebSocket:', error);
      return {
        success: false,
        error: error.message || 'Failed to create session'
      };
    }
  }

  @SubscribeMessage('joinSession')
  handleJoinSession(client: Socket, sessionId: string) {
    try {
      // Make sure this is the active client
      this.activeClientId = client.id;
      
      // Check if session exists (will always get the active session)
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

  @SubscribeMessage('leaveSession')
  handleLeaveSession(client: Socket) {
    // Nothing to do in single-user mode
    apiLogger.info(`Client ${client.id} left session`);
    return { success: true };
  }

  @SubscribeMessage('cancelSession')
  handleCancelSession(client: Socket) {
    try {
      this.activeClientId = client.id;
      const result = this.sessionManagerService.cancelSession();
      return { success: result };
    } catch (error) {
      apiLogger.error(`Failed to cancel session:`, error);
      return { 
        success: false, 
        error: error.message || 'Failed to cancel session' 
      };
    }
  }

  @SubscribeMessage('takeScreenshot')
  async handleTakeScreenshot(client: Socket) {
    try {
      this.activeClientId = client.id;
      const screenshot = await this.sessionManagerService.takeScreenshot();
      return {
        success: true,
        screenshot
      };
    } catch (error) {
      apiLogger.error(`Failed to take screenshot:`, error);
      return {
        success: false,
        error: error.message || 'Failed to take screenshot'
      };
    }
  }

  @SubscribeMessage('sendFileAttachments')
  async handleSendFileAttachments(client: Socket, payload: { fileIds: any[] }) {
    try {
      this.activeClientId = client.id;

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

      // Emit a session update event with the file information
      if (isMetadataPayload) {
        // If we got full metadata objects
        this.sessionEvents.emitUpdate({
          status: session.status,
          files: payload.fileIds, // These are actually FileMetadataDto objects
          fileIds: ids // Also include the IDs for backward compatibility
        }, session.sessionId);

        return {
          success: true,
          message: `Received ${payload.fileIds.length} files with metadata`
        };
      } else {
        // If we just got file IDs
        this.sessionEvents.emitUpdate({
          status: session.status,
          fileIds: payload.fileIds
        }, session.sessionId);

        return {
          success: true,
          message: `Received ${payload.fileIds.length} file IDs`
        };
      }
    } catch (error) {
      apiLogger.error(`Failed to process file attachments:`, error);
      return {
        success: false,
        error: error.message || 'Failed to process file attachments'
      };
    }
  }

  // Removed WebSocket methods that are now handled by HTTP

  /**
   * Public method to emit a typed event to the WebSocket session
   * @template T Event type from the SessionEventName enum
   * @param event Event name from the SessionEventName enum
   * @param data Strongly typed event data
   */
  emitToSession<T extends SessionEventName>(
    event: T, 
    data: T extends SessionEventName.UPDATE ? SessionUpdateEvent : SessionErrorEvent
  ): void {
    try {
      if (this.activeClientId) {
        apiLogger.debug(`Emitting ${event} to active client ${this.activeClientId}`);
        this.server.to(this.activeClientId).emit(event, data);
      } else {
        apiLogger.debug(`No active client to emit ${event}`);
      }
    } catch (error) {
      apiLogger.error(`Error emitting event:`, error);
    }
  }
}