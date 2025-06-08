/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';
import { sessionLogger } from '../../../common/services/logger.service';
import { SocketEventDto } from '@app/shared/dto';
import { StatusEnum } from '@app/packages/ui-tars/shared/src/types';

/**
 * Simplified events service for session-related events
 * Using a single shared EventEmitter instance to prevent duplicate events
 */
@Injectable()
export class SessionEventsService {
  // Using a static EventEmitter to ensure a single instance across the application
  private static sharedEmitter: EventEmitter = new EventEmitter();

  // Set max listeners to prevent memory leaks
  constructor() {
    SessionEventsService.sharedEmitter.setMaxListeners(20);
  }

  /**
   * Emit a session status event with payload
   */
  emit(event: string, payload: any): void {
    try {
      sessionLogger.debug(`Emitting ${event} event: ${JSON.stringify(payload)}`);
      SessionEventsService.sharedEmitter.emit(event, payload);
    } catch (error) {
      sessionLogger.error(`Failed to emit ${event} event:`, error);
    }
  }

  /**
   * Helper method to create and emit a status event
   */
  emitStatus(message: string, status: StatusEnum, sessionId: string, data?: any): void {
    try {
      const payload: SocketEventDto = {
        sessionId,
        message,
        status,
        data
      };

      sessionLogger.debug(`Emitting sessionStatus event: ${JSON.stringify(payload)}`);
      SessionEventsService.sharedEmitter.emit('sessionStatus', payload);
    } catch (error) {
      sessionLogger.error(`Failed to emit sessionStatus event:`, error);
    }
  }

  /**
   * Subscribe to an event - checks for duplicate listeners
   */
  on(event: string, listener: (data: any) => void): void {
    // Check if this listener is already registered to prevent duplicates
    if (SessionEventsService.sharedEmitter.listenerCount(event) > 0) {
      sessionLogger.warn(`Event listener for ${event} already exists. Removing existing listeners first.`);
      SessionEventsService.sharedEmitter.removeAllListeners(event);
    }

    SessionEventsService.sharedEmitter.on(event, listener);
    sessionLogger.info(`Added listener for ${event} event. Total listeners: ${SessionEventsService.sharedEmitter.listenerCount(event)}`);
  }

  /**
   * Remove event listener
   */
  off(event: string, listener: (data: any) => void): void {
    SessionEventsService.sharedEmitter.off(event, listener);
    sessionLogger.info(`Removed listener for ${event} event. Remaining listeners: ${SessionEventsService.sharedEmitter.listenerCount(event)}`);
  }
}