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
import { getActiveRequests, resumeExecution } from '../../../../tools/humanLayerTool';

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
    // SIMPLIFIED: Use a single event channel for all session status updates
    this.sessionEvents.on('sessionStatus', (data: SocketEventDto) => {
      this.emitToActiveClient('sessionStatus', data);
    });

    apiLogger.info('WebSocket event listeners initialized with simplified approach');
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

  @SubscribeMessage('approveHumanLayerRequest')
  handleApproveHumanLayerRequest(client: Socket, requestId: string) {
    try {
      this.activeClientId = client.id;
      // Using imported resumeExecution
      const success = resumeExecution(requestId);

      apiLogger.info(`Client ${client.id} ${success ? 'approved' : 'failed to approve'} human layer request: ${requestId}`);

      return { success };
    } catch (error) {
      apiLogger.error(`Failed to approve human layer request:`, error);
      return {
        success: false,
        error: error.message || 'Failed to approve request'
      };
    }
  }

  @SubscribeMessage('getHumanLayerRequests')
  handleGetHumanLayerRequests(client: Socket) {
    try {
      this.activeClientId = client.id;
      // Using imported getActiveRequests
      const requests = getActiveRequests();

      apiLogger.info(`Client ${client.id} requested ${requests.length} human layer requests`);

      return {
        success: true,
        requests
      };
    } catch (error) {
      apiLogger.error(`Failed to get human layer requests:`, error);
      return {
        success: false,
        error: error.message || 'Failed to get requests'
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

      // SIMPLIFIED: Emit a session status update directly with emitStatus
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

  /**
   * Emit an event to the active client
   */
  emitToActiveClient(event: string, data: any): void {
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