/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { SessionStatus } from '../../../shared/constants';
import { FileMetadataDto } from '../dto/sessions.dto';

/**
 * Base event type with session ID
 */
export interface SessionEventBase {
  sessionId: string;
}

/**
 * Conversation entry interface
 */
export interface ConversationEntry {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
  fileIds?: string[]; // Array of file IDs that were attached to this message
  files?: FileMetadataDto[]; // Array of file metadata objects
}

/**
 * Session update event payload
 */
export interface SessionUpdateEvent extends SessionEventBase {
  status: SessionStatus;
  conversations?: Array<ConversationEntry>;
  errorMsg?: string;
  fileIds?: string[]; // Array of file IDs that are attached to this event
  files?: FileMetadataDto[]; // Array of file metadata objects
}

/**
 * Session error event payload
 */
export interface SessionErrorEvent extends SessionEventBase {
  error: string;
  status?: SessionStatus;
}

/**
 * Union type of all event payloads
 */
export type SessionEventPayload = SessionUpdateEvent | SessionErrorEvent;

/**
 * Event name constants
 */
export enum SessionEventName {
  UPDATE = 'sessionUpdate',
  ERROR = 'sessionError',
}

/**
 * Type mapping from event names to their respective payload types
 */
export interface SessionEventMap {
  [SessionEventName.UPDATE]: SessionUpdateEvent;
  [SessionEventName.ERROR]: SessionErrorEvent;
}