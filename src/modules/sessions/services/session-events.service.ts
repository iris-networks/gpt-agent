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
 */
@Injectable()
export class SessionEventsService {
  private eventEmitter = new EventEmitter();

  /**
   * Emit a session status event with payload
   */
  emit(event: string, payload: any): void {
    try {
      sessionLogger.debug(`Emitting ${event} event: ${JSON.stringify(payload)}`);
      this.eventEmitter.emit(event, payload);
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
      this.eventEmitter.emit('sessionStatus', payload);
    } catch (error) {
      sessionLogger.error(`Failed to emit sessionStatus event:`, error);
    }
  }

  /**
   * Subscribe to an event
   */
  on(event: string, listener: (data: any) => void): void {
    this.eventEmitter.on(event, listener);
  }

  /**
   * Remove event listener
   */
  off(event: string, listener: (data: any) => void): void {
    this.eventEmitter.off(event, listener);
  }
}