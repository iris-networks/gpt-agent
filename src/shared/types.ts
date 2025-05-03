/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { Operator } from '@ui-tars/sdk/dist/core';
import { SessionStatus, OperatorType } from './constants';
import { Tool } from 'ai';

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
  abortController?: AbortController;
}

/**
 * Session response interface
 */
export interface SessionResponse {
  sessionId: string;
  status: SessionStatus;
  operator: OperatorType;
  conversations?: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: number;
  }>;
  errorMsg?: string;
}

/**
 * Session data interface
 */
export interface SessionData {
  id: string;
  agent: Tool;
  operator: Operator;
  conversations: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: number;
  }>;
  status: SessionStatus;
  instructions: string;
  operatorType: OperatorType;
  errorMsg?: string;
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