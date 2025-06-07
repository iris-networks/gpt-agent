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
   * Using static flag to ensure we only initialize once
   */
  onModuleInit() {
    if (SessionsGateway.eventListenerBound) {
      apiLogger.info('Event listeners already initialized, skipping');
      return;
    }

    // Register event listener just once for all session status updates
    this.sessionEvents.on('sessionStatus', (data: SocketEventDto) => {
      apiLogger.debug(`Broadcasting session status update to all clients`);
      this.server.emit('sessionStatus', data);
    });

    SessionsGateway.eventListenerBound = true;
    apiLogger.info('WebSocket event listeners initialized with broadcast approach');
  }

  handleConnection(client: Socket) {
    apiLogger.info(`Client connected: ${client.id}`);

    // If we weren't initialized before, we are now
    if (!SessionsGateway.isInitialized) {
      SessionsGateway.isInitialized = true;
    }
  }

  handleDisconnect(client: Socket) {
    apiLogger.info(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('createSession')
  async handleCreateSession(client: Socket, payload: CreateSessionDto) {
    try {
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
}