/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { SessionStatus, OperatorType } from './constants';

/**
 * System configuration interface
 */
export interface IrisConfig {
  vlmBaseUrl: string;
  vlmApiKey: string;
  vlmModelName: string;
  vlmProvider: string;
  language: string;
  defaultOperator: OperatorType;
  maxLoopCount: number;
  loopIntervalInMs: number;
}

/**
 * Session creation request interface
 */
export interface CreateSessionRequest {
  instructions: string;
  operator?: OperatorType;
  config?: Partial<IrisConfig>;
}

/**
 * Session response interface
 */
export interface SessionResponse {
  sessionId: string;
  status: SessionStatus;
  operator: OperatorType;
  conversations?: any[];
  errorMsg?: string;
}

/**
 * Session data interface
 */
export interface SessionData {
  id: string;
  agent: any;
  abortController: AbortController;
  operator: any;
  conversations: any[];
  status: SessionStatus;
  instructions: string;
  operatorType: OperatorType;
  errorMsg?: string;
  eventEmitter?: any;
  timestamps: {
    created: number;
    updated: number;
    completed?: number;
  };
}

/**
 * Screenshot response interface
 */
export interface ScreenshotResponse {
  success: boolean;
  screenshot?: string;
  error?: string;
}

/**
 * Configuration update request interface
 */
export interface ConfigUpdateRequest {
  config: Partial<IrisConfig>;
}