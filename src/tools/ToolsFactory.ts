import { Injectable } from '@nestjs/common';
import { GuiAgentTool } from './GuiAgentTool';
import { ExcelTool } from './ExcelTool';
import { Operator, UITarsModelConfig } from '@app/packages/ui-tars/sdk/src/core';
import { AgentStatusCallback } from '../agent_v2/types';
import { DEFAULT_CONFIG } from '@app/shared/constants';
import { Conversation } from '@app/packages/ui-tars/shared/src/types';
import { TerminalAgentTool } from './TerminalAgentTool';
import { QutebrowserAgentTool } from './QutebrowserAgentTool';

@Injectable()
export class ToolsFactory {
  createGuiAgentTool(options: {
    operator: Operator;
    statusCallback: AgentStatusCallback;    // MANDATORY
    abortController: AbortController;       // MANDATORY
    onScreenshot?: (base64: string, conversation: Conversation) => void;
  }): GuiAgentTool {
    return new GuiAgentTool({
      statusCallback: options.statusCallback,
      abortController: options.abortController,
      operator: options.operator,
      timeout: 120000,
      config: {
        "baseURL": process.env.VLM_BASE_URL,
        "apiKey": process.env.VLM_API_KEY,
        "model": DEFAULT_CONFIG.VLM_MODEL_NAME,
      } as UITarsModelConfig,
      onScreenshot: options.onScreenshot
    });
  }


  createExcelTool(options: {
    statusCallback: AgentStatusCallback;    // MANDATORY
    abortController: AbortController;       // MANDATORY
  }): ExcelTool {
    return new ExcelTool({
      statusCallback: options.statusCallback,
      abortController: options.abortController
    });
  }



  createTerminalTool(options: {
    statusCallback: AgentStatusCallback;    // MANDATORY
    abortController: AbortController;       // MANDATORY
  }): TerminalAgentTool {
    return new TerminalAgentTool({
      statusCallback: options.statusCallback,
      abortController: options.abortController
    });
  }

  createQutebrowserTool(options: {
    statusCallback: AgentStatusCallback;    // MANDATORY
    abortController: AbortController;       // MANDATORY
    operator: Operator;                     // MANDATORY
  }): QutebrowserAgentTool {
    return new QutebrowserAgentTool({
      statusCallback: options.statusCallback,
      abortController: options.abortController,
    });
  }

  /**
   * Create all tools at once with consistent parameters
   * Returns AI SDK tool definitions ready for use
   */
  createAllTools(options: {
    statusCallback: AgentStatusCallback;    // MANDATORY
    abortController: AbortController;       // MANDATORY
    operator: Operator;
    onScreenshot?: (base64: string, conversation: Conversation) => void;
  }) {
    const guiAgentTool = this.createGuiAgentTool({
      operator: options.operator,
      statusCallback: options.statusCallback,
      abortController: options.abortController,
      onScreenshot: options.onScreenshot
    });

    const excelTool = this.createExcelTool({
      statusCallback: options.statusCallback,
      abortController: options.abortController
    });

    const terminalTool = this.createTerminalTool({
      statusCallback: options.statusCallback,
      abortController: options.abortController
    });

    const qutebrowserTool = this.createQutebrowserTool({
      statusCallback: options.statusCallback,
      abortController: options.abortController,
      operator: options.operator
    });

    return {
      // Return AI SDK tool definitions - compatible with ToolSet
      guiAgent: guiAgentTool.getToolDefinition(),
      excelTool: excelTool.getToolDefinition(),
      terminalAgent: terminalTool.getToolDefinition(),
      qutebrowserAgent: qutebrowserTool.getToolDefinition()
    };
  }

  /**
   * Create individual tool instances (useful for dependency injection scenarios)
   */
  createToolInstances(options: {
    statusCallback: AgentStatusCallback;    // MANDATORY
    abortController: AbortController;       // MANDATORY
    operator: Operator;
    onScreenshot?: (base64: string, conversation: Conversation) => void;
  }) {
    return {
      guiAgent: this.createGuiAgentTool({
        operator: options.operator,
        statusCallback: options.statusCallback,
        abortController: options.abortController,
        onScreenshot: options.onScreenshot
      }),
      
      excel: this.createExcelTool({
        statusCallback: options.statusCallback,
        abortController: options.abortController
      }),

      terminal: this.createTerminalTool({
        statusCallback: options.statusCallback,
        abortController: options.abortController
      }),

      qutebrowser: this.createQutebrowserTool({
        statusCallback: options.statusCallback,
        abortController: options.abortController,
        operator: options.operator
      })
    };
  }
}