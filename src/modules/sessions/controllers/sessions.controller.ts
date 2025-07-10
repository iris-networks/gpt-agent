/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { SessionManagerService } from '../services/session-manager.service';
import { apiLogger } from '../../../common/services/logger.service';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionManagerService: SessionManagerService) {}

  /**
   * Cancel the current session execution
   */
  @Delete('cancel')
  @HttpCode(HttpStatus.OK)
  async cancelSession() {
    try {
      const result = this.sessionManagerService.cancelSession();
      apiLogger.info('Session cancelled via REST API');
      return { success: result };
    } catch (error) {
      apiLogger.error('Failed to cancel session via REST API:', error);
      return {
        success: false,
        error: error.message || 'Failed to cancel session'
      };
    }
  }
}