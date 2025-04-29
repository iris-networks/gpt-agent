/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import * as dotenv from 'dotenv';
import { DEFAULT_CONFIG, OperatorType } from '../../shared/constants';
import { IrisConfig } from '../../shared/types';
import { mainLogger } from '../utils/logger';

// Load environment variables
dotenv.config();

/**
 * Configuration service for Iris
 */
export class ConfigService {
  private static instance: ConfigService;
  private config: IrisConfig;

  private constructor() {
    this.config = {
      vlmBaseUrl: DEFAULT_CONFIG.VLM_BASE_URL,
      vlmApiKey: DEFAULT_CONFIG.VLM_API_KEY,
      vlmModelName: DEFAULT_CONFIG.VLM_MODEL_NAME,
      vlmProvider: DEFAULT_CONFIG.VLM_PROVIDER,
      language: process.env.LANGUAGE || DEFAULT_CONFIG.LANGUAGE,
      defaultOperator:
        (process.env.DEFAULT_OPERATOR as OperatorType) ||
        (DEFAULT_CONFIG.DEFAULT_OPERATOR as OperatorType),
      maxLoopCount: parseInt(
        process.env.MAX_LOOP_COUNT || DEFAULT_CONFIG.MAX_LOOP_COUNT.toString(),
      ),
      loopIntervalInMs: parseInt(
        process.env.LOOP_INTERVAL_MS ||
          DEFAULT_CONFIG.LOOP_INTERVAL_MS.toString(),
      ),
    };

    mainLogger.info('Config initialized');
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  /**
   * Get current config
   */
  public getConfig(): IrisConfig {
    return { ...this.config };
  }

  /**
   * Update config
   */
  public updateConfig(partialConfig: Partial<IrisConfig>): IrisConfig {
    this.config = { ...this.config, ...partialConfig };
    mainLogger.info('Config updated', partialConfig);
    return this.getConfig();
  }

  /**
   * Get the port to run the server on
   */
  public getPort(): number {
    return parseInt(process.env.PORT || DEFAULT_CONFIG.PORT.toString());
  }

  /**
   * Get the host to run the server on
   */
  public getHost(): string {
    return process.env.HOST || DEFAULT_CONFIG.HOST;
  }
}

export default ConfigService;
