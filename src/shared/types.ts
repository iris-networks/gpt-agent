/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { Operator } from '@ui-tars/sdk/dist/core';
import { SessionStatus, OperatorType } from './constants';
import { Tool } from 'ai';
import { ReactAgent } from '@app/agents/reAct';
import { Conversation } from '@ui-tars/shared/types';

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
 * Screenshot interface
 */
export interface Screenshot {
  base64: string;
  timestamp: number;
  conversation: Conversation; // The entire conversation object containing all data
}

/**
 * Video generation status enum
 */
export enum VideoGenerationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

/**
 * Video recording metadata interface
 */
export interface VideoRecording {
  id: string;
  sessionId: string;
  title: string;
  description?: string;
  createdAt: number;
  duration: number;
  frameCount: number;
  thumbnailPath?: string;
  filePath: string;
  size: number;
  
  // Video file properties (added when a video is generated)
  videoGenerationStatus?: VideoGenerationStatus;
  videoGenerationStartedAt?: number;
  videoGenerationCompletedAt?: number;
  videoGenerationError?: string;
  hasVideo?: boolean;
  videoPath?: string;
  videoFormat?: string;
  videoSize?: number;
}

/**
 * Session data interface
 */
export interface SessionData {
  id: string;
  agent: ReactAgent;
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