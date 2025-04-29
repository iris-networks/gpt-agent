/*
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Agent execution states
 */
export enum AgentState {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  FINISHED = 'FINISHED',
  ERROR = 'ERROR',
}

export interface Function {
  name: string;
  arguments: string;
}

export interface ToolCall {
  id: string;
  type: string;
  function: Function;
}

export type MessageRole = 'system' | 'user' | 'assistant' | 'tool';

export interface MessageData {
  role: MessageRole;
  content?: string | null;
  tool_calls?: ToolCall[];
  name?: string;
  tool_call_id?: string;
}

/**
 * Represents a chat message in the conversation
 */
export class Message {
  readonly role: MessageRole;
  readonly content: string | null;
  readonly tool_calls?: ToolCall[];
  readonly name?: string;
  readonly tool_call_id?: string;

  constructor({
    role,
    content = null,

    tool_calls,
    name,
    tool_call_id,
  }: MessageData) {
    this.role = role;
    this.content = content;
    this.tool_calls = tool_calls;
    this.name = name;
    this.tool_call_id = tool_call_id;
  }

  /**
   * Serialize message to a plain object
   */
  toJSON(): MessageData {
    const data: MessageData = { role: this.role };

    if (this.content !== null) {
      data.content = this.content;
    }

    if (this.tool_calls) {
      data.tool_calls = this.tool_calls;
    }

    if (this.name) {
      data.name = this.name;
    }

    if (this.tool_call_id) {
      data.tool_call_id = this.tool_call_id;
    }

    return data;
  }

  /**
   * Convert message to dictionary format
   */
  toObject(): Record<string, any> {
    const message: Record<string, any> = { role: this.role };

    if (this.content !== null) {
      message.content = this.content;
    }

    if (this.tool_calls !== undefined) {
      message.tool_calls = this.tool_calls;
    }

    if (this.name !== undefined) {
      message.name = this.name;
    }

    if (this.tool_call_id !== undefined) {
      message.tool_call_id = this.tool_call_id;
    }

    return message;
  }

  /**
   * Create a user message
   */
  static userMessage(content: string): Message {
    return new Message({ role: 'user', content });
  }

  /**
   * Create a system message
   */
  static systemMessage(content: string): Message {
    return new Message({ role: 'system', content });
  }

  /**
   * Create an assistant message
   */
  static assistantMessage(content: string | null = null): Message {
    return new Message({ role: 'assistant', content });
  }

  /**
   * Create a tool message
   */
  static toolMessage(
    content: string,
    name: string,
    tool_call_id: string,
  ): Message {
    return new Message({ role: 'tool', content, name, tool_call_id });
  }

  /**
   * Create ToolCallsMessage from raw tool calls
   */
  static fromToolCalls(
    tool_calls: ToolCall[],
    content: string = '',
    kwargs: Record<string, any> = {},
  ): Message {
    const formattedCalls = tool_calls.map((call) => ({
      id: call.id,
      function: call.function,
      type: 'function',
    }));

    return new Message({
      role: 'assistant',
      content,
      tool_calls: formattedCalls,
      ...kwargs,
    });
  }

  /**
   * Convert message instance to plain object for IPC transfer
   */
  static toTransferableData(message: Message): MessageData {
    return {
      role: message.role,
      content: message.content,
      tool_calls: message.tool_calls,
      name: message.name,
      tool_call_id: message.tool_call_id,
    };
  }

  /**
   * Create Message instance from transferable data
   */
  static fromTransferableData(data: MessageData): Message {
    return new Message(data);
  }
}
