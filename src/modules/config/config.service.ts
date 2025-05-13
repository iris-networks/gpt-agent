/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { IrisConfigDto } from '../../shared/dto';
import { DEFAULT_CONFIG, OperatorType } from '../../shared/constants';
import { configLogger } from '../../common/services/logger.service';

@Injectable()
export class ConfigService {
  private config: IrisConfigDto;

  constructor() {
    // Load environment variables
    dotenv.config();

    // Initialize configuration
    this.config = {
      vlmBaseUrl: process.env.VLM_BASE_URL || DEFAULT_CONFIG.VLM_BASE_URL,
      vlmApiKey: process.env.VLM_API_KEY || DEFAULT_CONFIG.VLM_API_KEY,
      
      // example: tgi
      vlmModelName: process.env.VLM_MODEL_NAME || DEFAULT_CONFIG.VLM_MODEL_NAME,


      // to be used to switch between tars models
      vlmProvider: process.env.VLM_PROVIDER || DEFAULT_CONFIG.VLM_PROVIDER,
      language: process.env.LANGUAGE || DEFAULT_CONFIG.LANGUAGE,
      defaultOperator: (process.env.DEFAULT_OPERATOR as OperatorType) || DEFAULT_CONFIG.DEFAULT_OPERATOR as OperatorType,
      maxLoopCount: parseInt(process.env.MAX_LOOP_COUNT || DEFAULT_CONFIG.MAX_LOOP_COUNT.toString(), 25),
      loopIntervalInMs: parseInt(process.env.LOOP_INTERVAL_MS || DEFAULT_CONFIG.LOOP_INTERVAL_MS.toString(), 10),
    };

    configLogger.log('Configuration initialized');
  }

  /**
   * Get current configuration
   */
  getConfig(): IrisConfigDto {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<IrisConfigDto>): IrisConfigDto {
    this.config = { ...this.config, ...newConfig };
    configLogger.log('Configuration updated');
    return this.getConfig();
  }

  /**
   * Get server port
   */
  getPort(): number {
    return parseInt(process.env.PORT || DEFAULT_CONFIG.PORT.toString(), 10);
  }

  /**
   * Get server host
   */
  getHost(): string {
    return process.env.HOST || DEFAULT_CONFIG.HOST;
  }
}