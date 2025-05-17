/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { FileMetadataDto } from '../dto/sessions.dto';
import { SocketEventDto } from '../../../shared/dto';
import { StatusEnum } from '@ui-tars/shared/types';

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
 * Human layer request interface for event payload
 */
export interface HumanLayerRequestEvent {
  id: string;
  title: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'timed_out';
  timestamp: number;
  timeoutAt: number;
}

/**
 * @deprecated Use SocketEventDto instead
 * Session update event payload
 */
export interface SessionUpdateEvent extends SessionEventBase {
  status: StatusEnum;
  conversations?: Array<ConversationEntry>;
  errorMsg?: string;
  fileIds?: string[]; // Array of file IDs that are attached to this event
  files?: FileMetadataDto[]; // Array of file metadata objects
  humanLayerRequest?: HumanLayerRequestEvent; // Human layer request if this is a human intervention event
}

/**
 * @deprecated Use SocketEventDto instead
 * Session error event payload
 */
export interface SessionErrorEvent extends SessionEventBase {
  error: string;
  status?: StatusEnum;
}
