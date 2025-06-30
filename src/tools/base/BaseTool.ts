import { StatusEnum } from '@app/packages/ui-tars/shared/src/types';
import { AgentStatusCallback } from '../../agent_v2/types';

export abstract class BaseTool {
  protected statusCallback: AgentStatusCallback; // MANDATORY
  protected abortController: AbortController;   // MANDATORY

  constructor(options: {
    statusCallback: AgentStatusCallback;  // Required for all tools
    abortController: AbortController;     // Required for all tools
  }) {
    this.statusCallback = options.statusCallback;
    this.abortController = options.abortController;
  }

  /**
   * Send status update directly from the tool to the frontend
   */
  protected emitStatus(message: string, status: StatusEnum, data?: any): void {
    this.statusCallback(message, status, data);
  }

  /**
   * Abstract method that each tool must implement to return its AI SDK tool definition
   */
  abstract getToolDefinition(): any;
}