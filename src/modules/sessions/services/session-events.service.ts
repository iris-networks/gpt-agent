/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';
import { sessionLogger } from '../../../common/services/logger.service';
import { 
  SessionEventMap, 
  SessionEventName, 
  SessionEventPayload 
} from '../interfaces/session-events.interface';

/**
 * Type-safe service for handling session-related events to avoid circular dependencies
 */
@Injectable()
export class SessionEventsService {
  private eventEmitter = new EventEmitter();

  /**
   * Emit a session update event with strongly typed payload
   */
  emitUpdate(data: Omit<SessionEventMap[SessionEventName.UPDATE], 'sessionId'>, sessionId: string): void {
    try {
      const payload = { ...data, sessionId };

      // Add extra debug information for error status
      if (data.status === 'error' && data.errorMsg) {
        sessionLogger.debug(`Emitting ${SessionEventName.UPDATE} event for session ${sessionId} with ERROR status: ${data.errorMsg}`);

        // Create an Error object to capture the stack trace at this point
        const stackTrace = new Error().stack || '';
        sessionLogger.debug(`Event emission stacktrace: ${stackTrace}`);
      } else if (data.fileIds && data.fileIds.length > 0) {
        // Log when file IDs are attached
        sessionLogger.debug(`Emitting ${SessionEventName.UPDATE} event for session ${sessionId} with file attachments: ${data.fileIds.join(', ')}`);
      } else {
        sessionLogger.debug(`Emitting ${SessionEventName.UPDATE} event: ${JSON.stringify(payload)}`);
      }

      this.eventEmitter.emit(SessionEventName.UPDATE, payload);
    } catch (error) {
      sessionLogger.error(error);
    }
  }

  /**
   * Emit a session error event with strongly typed payload
   */
  emitError(data: Omit<SessionEventMap[SessionEventName.ERROR], 'sessionId'>, sessionId: string): void {
    try {
      const payload = { ...data, sessionId };
      sessionLogger.debug(`Emitting ${SessionEventName.ERROR} event: ${JSON.stringify(payload)}`);
      this.eventEmitter.emit(SessionEventName.ERROR, payload);
    } catch (error) {
      sessionLogger.error(`Failed to emit ${SessionEventName.ERROR} event:`, error);
    }
  }

  /**
   * Subscribe to a specific event type with type checking
   */
  on<T extends SessionEventName>(
    event: T, 
    listener: (data: SessionEventMap[T]) => void
  ): void {
    this.eventEmitter.on(event, listener);
  }

  /**
   * Remove event listener
   */
  off<T extends SessionEventName>(
    event: T, 
    listener: (data: SessionEventMap[T]) => void
  ): void {
    this.eventEmitter.off(event, listener);
  }
}