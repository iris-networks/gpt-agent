/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG = {
  PORT: 3000,
  HOST: '0.0.0.0',
  VLM_MODEL_NAME: 'tgi',
  VLM_PROVIDER: 'ui_tars_1_5',
  LANGUAGE: 'en',
  MAX_LOOP_COUNT: 10,
  LOOP_INTERVAL_MS: 1000,
  DEFAULT_OPERATOR: 'computer',
};

/**
 * Operator types enum
 */
export enum OperatorType {
  BROWSER = 'browser',
  COMPUTER = 'computer',
}

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  // RPA endpoints
  RPA: '/api/rpa',
  RPA_EXECUTE: '/api/rpa/execute',
  RPA_STATUS: '/api/rpa/:executionId/status',
  RPA_STOP: '/api/rpa/:executionId/stop',
};