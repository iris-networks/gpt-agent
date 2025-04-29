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
  VLM_BASE_URL: 'https://b1n60xzrn3arclvb.us-east-1.aws.endpoints.huggingface.cloud/v1',
  VLM_API_KEY: '***REMOVED***',
  VLM_MODEL_NAME: 'default-model',
  VLM_PROVIDER: 'ui_tars_1_5',
  LANGUAGE: 'en',
  MAX_LOOP_COUNT: 10,
  LOOP_INTERVAL_MS: 1000,
  DEFAULT_OPERATOR: 'browser',
};

/**
 * Status enum for session states
 */
export enum SessionStatus {
  INITIALIZING = 'initializing',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ERROR = 'error',
  CANCELLED = 'cancelled',
}

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
  SESSIONS: '/api/sessions',
  SESSION: '/api/sessions/:sessionId',
  CANCEL_SESSION: '/api/sessions/:sessionId/cancel',
  PAUSE_SESSION: '/api/sessions/:sessionId/pause',
  RESUME_SESSION: '/api/sessions/:sessionId/resume',
  SCREENSHOT: '/api/sessions/:sessionId/screenshot',
  CONFIG: '/api/config',
  OPERATORS: '/api/operators',
  OPERATOR: '/api/operators/:operatorId',
  OPERATOR_EXECUTE: '/api/operators/:operatorId/execute',
  OPERATOR_CANCEL: '/api/operators/:operatorId/cancel',
  OPERATOR_SCREENSHOT: '/api/operators/:operatorId/screenshot',
  OPERATOR_CONVERSATIONS: '/api/operators/:operatorId/conversations',
  OPERATOR_CONFIGS: '/api/operators/configs',
  OPERATOR_UI: '/operator-ui',
};
