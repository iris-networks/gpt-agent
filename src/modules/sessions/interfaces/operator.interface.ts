import { BaseOperator } from "@app/packages/ui-tars/sdk/src/base";


/**
 * Operator interface for session management
 * This type is used to provide strong typing for the operator objects
 * received from the UI-TARS SDK
 */
export interface IOperator extends BaseOperator {
  // Common operator methods
  takeScreenshot(): Promise<Buffer>;
  close(): Promise<void>;
}

/**
 * GuiAgentTool interface for session management
 */
export interface IGuiAgentTool {
  description: string;
  execute: (params: { command: string }, context?: any) => Promise<{
    success: boolean;
    result: string;
  }>;
}

/**
 * Agent interface for session management
 */
export interface IAgent {
  guiAgentTool: IGuiAgentTool;
}

/**
 * Conversation entry interface
 */
export interface IConversationEntry {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}