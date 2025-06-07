/*
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Message, MessageData } from './Message';

/**
 * Memory system for managing conversation history
 */
export class Memory {
  private messages: Message[];
  private readonly maxMessages: number;

  constructor(messages: Message[] = [], maxMessages: number = 100) {
    this.messages = messages;

    this.maxMessages = maxMessages;
  }

  /**
   * Get all messages in the memory
   */
  getMessages(): readonly Message[] {
    return this.messages;
  }

  /**
   * Add a message to memory
   */
  addMessage(message: Message): void {
    this.messages.push(message);

    // Optional: Implement message limit

    if (this.messages.length > this.maxMessages) {
      this.messages = this.messages.slice(-this.maxMessages);
    }
  }

  /**
   * Add multiple messages to memory
   */
  addMessages(messages: Message[]): void {
    this.messages.push(...messages);
  }

  /**
   * Clear all messages
   */
  clear(): void {
    this.messages = [];
  }

  /**
   * Get n most recent messages
   */
  getRecentMessages(n: number): Message[] {
    return this.messages.slice(-n);
  }

  /**
   * Convert messages to list of objects
   */
  normalize(): Record<string, any>[] {
    return this.messages.map((msg) => msg.toObject());
  }

  /**
   * Serialize messages to plain objects
   */
  toJSON(): MessageData[] {
    return this.messages.map((msg) => msg.toJSON());
  }
}
