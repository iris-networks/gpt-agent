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
import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { CreateSessionDto } from '../dto/sessions.dto';
import { SessionManagerService } from '../services/session-manager.service';
import { apiLogger } from '../../../common/services/logger.service';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SessionsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() 
  server: Server;

  // Map to track which client is connected to which session
  private clientToSessionMap = new Map<string, string>();
  // Map to track which session has which clients
  private sessionToClientsMap = new Map<string, Set<string>>();

  constructor(
    @Inject(forwardRef(() => SessionManagerService))
    private readonly sessionManagerService: SessionManagerService
  ) {}

  afterInit() {
    apiLogger.info('WebSocket Sessions Gateway Initialized');
  }

  handleConnection(client: Socket) {
    apiLogger.info(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const sessionId = this.clientToSessionMap.get(client.id);
    
    if (sessionId) {
      // Remove this client from session-to-clients mapping
      const clients = this.sessionToClientsMap.get(sessionId);
      if (clients) {
        clients.delete(client.id);
        
        if (clients.size === 0) {
          this.sessionToClientsMap.delete(sessionId);
        }
      }
      
      // Remove from client-to-session mapping
      this.clientToSessionMap.delete(client.id);
    }
    
    apiLogger.info(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('createSession')
  async handleCreateSession(client: Socket, payload: CreateSessionDto) {
    try {
      const sessionId = await this.sessionManagerService.createSession(payload);
      apiLogger.info(`Session ${sessionId} created via WebSocket by client ${client.id}`);
      
      // Associate this client with the session
      this.clientToSessionMap.set(client.id, sessionId);
      
      // Add this client to the session's client list
      if (!this.sessionToClientsMap.has(sessionId)) {
        this.sessionToClientsMap.set(sessionId, new Set());
      }
      this.sessionToClientsMap.get(sessionId).add(client.id);
      
      // Log the association
      apiLogger.info(`Client ${client.id} associated with session ${sessionId}`);
      
      // Get the session data
      const session = this.sessionManagerService.getSession(sessionId);
      
      // Register to the session's EventEmitter
      const sessionData = this.sessionManagerService['sessions'].get(sessionId);
      if (sessionData && sessionData.eventEmitter) {
        // Remove any existing listeners to prevent duplicates
        sessionData.eventEmitter.removeAllListeners('update');
        sessionData.eventEmitter.removeAllListeners('error');
        
        // Add new listeners
        sessionData.eventEmitter.on('update', (data) => {
          apiLogger.debug(`EventEmitter update for session ${sessionId}:`, data);
          this.emitToSession(sessionId, 'sessionUpdate', {
            sessionId,
            ...data,
          });
        });
        
        sessionData.eventEmitter.on('error', (data) => {
          apiLogger.debug(`EventEmitter error for session ${sessionId}:`, data);
          this.emitToSession(sessionId, 'sessionError', {
            sessionId,
            ...data,
          });
        });
        
        apiLogger.info(`Event listeners registered for session ${sessionId}`);
      } else {
        apiLogger.warn(`No eventEmitter found for session ${sessionId}`);
      }
      
      return { sessionId, success: true, status: session.status };
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
      // Check if session exists
      const session = this.sessionManagerService.getSession(sessionId);
      apiLogger.info(`Client ${client.id} joining session ${sessionId}, status: ${session.status}`);
      
      // Associate this client with the session
      this.clientToSessionMap.set(client.id, sessionId);
      
      // Add this client to the session's client list
      if (!this.sessionToClientsMap.has(sessionId)) {
        this.sessionToClientsMap.set(sessionId, new Set());
      }
      this.sessionToClientsMap.get(sessionId).add(client.id);
      
      // Register to the session's EventEmitter if not already done
      const sessionData = this.sessionManagerService['sessions'].get(sessionId);
      if (sessionData && sessionData.eventEmitter) {
        // Get current listener count
        const updateListenerCount = sessionData.eventEmitter.listenerCount('update');
        const errorListenerCount = sessionData.eventEmitter.listenerCount('error');
        
        apiLogger.debug(`Session ${sessionId} has ${updateListenerCount} update listeners and ${errorListenerCount} error listeners`);
        
        // Only add listeners if needed
        if (updateListenerCount === 0) {
          sessionData.eventEmitter.on('update', (data) => {
            apiLogger.debug(`EventEmitter update for session ${sessionId}:`, data);
            this.emitToSession(sessionId, 'sessionUpdate', {
              sessionId,
              ...data,
            });
          });
        }
        
        if (errorListenerCount === 0) {
          sessionData.eventEmitter.on('error', (data) => {
            apiLogger.debug(`EventEmitter error for session ${sessionId}:`, data);
            this.emitToSession(sessionId, 'sessionError', {
              sessionId,
              ...data,
            });
          });
        }
      }
      
      return { 
        success: true,
        session
      };
    } catch (error) {
      apiLogger.error(`Failed to join session ${sessionId}:`, error);
      return { 
        success: false, 
        error: error.message || 'Failed to join session' 
      };
    }
  }

  @SubscribeMessage('leaveSession')
  handleLeaveSession(client: Socket) {
    const sessionId = this.clientToSessionMap.get(client.id);
    
    if (sessionId) {
      // Remove this client from session-to-clients mapping
      const clients = this.sessionToClientsMap.get(sessionId);
      if (clients) {
        clients.delete(client.id);
        
        if (clients.size === 0) {
          this.sessionToClientsMap.delete(sessionId);
        }
      }
      
      // Remove from client-to-session mapping
      this.clientToSessionMap.delete(client.id);
      
      return { success: true };
    }
    
    return { success: false, error: 'Not in any session' };
  }

  @SubscribeMessage('cancelSession')
  handleCancelSession(client: Socket, sessionId: string) {
    try {
      const result = this.sessionManagerService.cancelSession(sessionId);
      return { success: result };
    } catch (error) {
      apiLogger.error(`Failed to cancel session ${sessionId}:`, error);
      return { 
        success: false, 
        error: error.message || 'Failed to cancel session' 
      };
    }
  }

  @SubscribeMessage('takeScreenshot')
  async handleTakeScreenshot(client: Socket, sessionId: string) {
    try {
      const screenshot = await this.sessionManagerService.takeScreenshot(sessionId);
      return { 
        success: true,
        screenshot 
      };
    } catch (error) {
      apiLogger.error(`Failed to take screenshot for session ${sessionId}:`, error);
      return { 
        success: false, 
        error: error.message || 'Failed to take screenshot' 
      };
    }
  }

  // Public method that can be called from other parts of the application
  emitToSession(sessionId: string, event: string, data: any): void {
    try {
      const clients = this.sessionToClientsMap.get(sessionId);
      
      if (clients && clients.size > 0) {
        apiLogger.debug(`Emitting ${event} to ${clients.size} clients for session ${sessionId}`);
        for (const clientId of clients) {
          this.server.to(clientId).emit(event, data);
        }
      } else {
        apiLogger.debug(`No clients found for session ${sessionId} to emit ${event}`);
      }
    } catch (error) {
      apiLogger.error(`Error emitting to session ${sessionId}:`, error);
    }
  }
}