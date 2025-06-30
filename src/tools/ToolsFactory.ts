import { Injectable } from '@nestjs/common';
import { GuiAgentTool } from './GuiAgentTool';
import { FileSystemTool } from './FileSystemTool';
import { ExcelTool } from './ExcelTool';
import { HumanLayerTool } from './HumanLayerTool';
import { ApplicationLauncherTool } from './ApplicationLauncherTool';
import { Operator, UITarsModelConfig } from '@app/packages/ui-tars/sdk/src/core';
import { AgentStatusCallback } from '../agent_v2/types';
import { DEFAULT_CONFIG } from '@app/shared/constants';
import { Conversation } from '@app/packages/ui-tars/shared/src/types';

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

  createFileSystemTool(options: {
    statusCallback: AgentStatusCallback;    // MANDATORY
    abortController: AbortController;       // MANDATORY
  }): FileSystemTool {
    return new FileSystemTool({
      statusCallback: options.statusCallback,
      abortController: options.abortController
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

  createHumanLayerTool(options: {
    statusCallback: AgentStatusCallback;    // MANDATORY
    abortController: AbortController;       // MANDATORY
  }): HumanLayerTool {
    return new HumanLayerTool({
      statusCallback: options.statusCallback,
      abortController: options.abortController
    });
  }

  createApplicationLauncherTool(options: {
    statusCallback: AgentStatusCallback;    // MANDATORY
    abortController: AbortController;       // MANDATORY
  }): ApplicationLauncherTool {
    return new ApplicationLauncherTool({
      statusCallback: options.statusCallback,
      abortController: options.abortController
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

    const fileSystemTool = this.createFileSystemTool({
      statusCallback: options.statusCallback,
      abortController: options.abortController
    });

    const excelTool = this.createExcelTool({
      statusCallback: options.statusCallback,
      abortController: options.abortController
    });

    const humanLayerTool = this.createHumanLayerTool({
      statusCallback: options.statusCallback,
      abortController: options.abortController
    });

    const applicationLauncherTool = this.createApplicationLauncherTool({
      statusCallback: options.statusCallback,
      abortController: options.abortController
    });

    return {
      // Return AI SDK tool definitions - compatible with ToolSet
      guiAgent: guiAgentTool.getToolDefinition(),
      fileAgentTool: fileSystemTool.getToolDefinition(),
      excelTool: excelTool.getToolDefinition(),
      humanLayerTool: humanLayerTool.getToolDefinition(),
      applicationLauncher: applicationLauncherTool.getToolDefinition()
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
      
      fileSystem: this.createFileSystemTool({
        statusCallback: options.statusCallback,
        abortController: options.abortController
      }),
      
      excel: this.createExcelTool({
        statusCallback: options.statusCallback,
        abortController: options.abortController
      }),
      
      humanLayer: this.createHumanLayerTool({
        statusCallback: options.statusCallback,
        abortController: options.abortController
      }),

      applicationLauncher: this.createApplicationLauncherTool({
        statusCallback: options.statusCallback,
        abortController: options.abortController
      })
    };
  }
}