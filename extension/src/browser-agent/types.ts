/**
 * Type definitions for the ReactAgent
 */

// External imports
import { z } from 'zod';

/**
 * Configuration options for the ReactAgent
 */
export type ReActAgentOptions = {
  /** Anthropic API key for authentication */
  apiKey: string;
  /** Custom system prompt, uses default if not provided */
  systemPrompt?: string;
  /** Maximum iterations before agent stops, defaults to 10 */
  maxIterations?: number;
  /** Array of tools available to the agent */
  tools: Tool[];
  /** Model name to use, defaults to Claude 3 Sonnet */
  modelName?: string;
};

/**
 * Observer interface for monitoring agent execution
 */
export type AgentObserver = {
  /** Called when agent state updates */
  onUpdate: (update: AgentUpdate) => void;
  /** Called when agent encounters an error */
  onError: (error: Error) => void;
  /** Called when agent completes its task */
  onComplete: (result: AgentResult) => void;
};

/**
 * Agent update notification
 */
export type AgentUpdate = {
  /** Type of update */
  key: string;
  /** Description of the update */
  value: string;
  /** Optional data payload */
  data?: any;
};

/**
 * Result returned when agent completes execution
 */
export type AgentResult = {
  /** Final answer text */
  text: string;
  /** Number of iterations performed */
  iterations: number;
};

/**
 * Tool interface for agent actions
 */
export type Tool = {
  /** Unique name of the tool */
  name: string;
  /** Description of what the tool does */
  description: string;
  /** Function that executes the tool with given input */
  execute: (input: any) => Promise<string>;
  /** Zod schema that validates the tool input */
  inputSchema: z.ZodObject<any>;
};