import { Injectable } from '@nestjs/common';
import { GuiAgentTool } from './GuiAgentTool';
import { ExcelAgent } from './ExcelAgent';
import { Operator, UITarsModelConfig } from '@app/packages/ui-tars/sdk/src/core';
import { AgentStatusCallback } from '../agent_v2/types';
import { DEFAULT_CONFIG } from '@app/shared/constants';
import { Conversation } from '@app/packages/ui-tars/shared/src/types';
import { TerminalAgentTool } from './TerminalAgentTool';
import { PlaywrightAgentTool } from './PlaywrightAgentTool';
import { HITLTool } from './HITLTool';
import { VercelAIToolSet } from 'composio-core';

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


  createExcelAgent(options: {
    statusCallback: AgentStatusCallback;    // MANDATORY
    abortController: AbortController;       // MANDATORY
  }): ExcelAgent {
    return new ExcelAgent({
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

  createPlaywrightTool(options: {
    statusCallback: AgentStatusCallback;    // MANDATORY
    abortController: AbortController;       // MANDATORY
  }): PlaywrightAgentTool {
    return new PlaywrightAgentTool({
      statusCallback: options.statusCallback,
      abortController: options.abortController,
    });
  }

  createHITLTool(options: {
    statusCallback: AgentStatusCallback;    // MANDATORY
    abortController: AbortController;       // MANDATORY
  }): HITLTool {
    return new HITLTool({
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
    composioApps?: string[];                // Composio app names
    entityId?: string;                      // Entity ID for Composio tools
    onScreenshot?: (base64: string, conversation: Conversation) => void;
  }) {
    const guiAgentTool = this.createGuiAgentTool({
      operator: options.operator,
      statusCallback: options.statusCallback,
      abortController: options.abortController,
      onScreenshot: options.onScreenshot
    });

    const excelAgent = this.createExcelAgent({
      statusCallback: options.statusCallback,
      abortController: options.abortController
    });

    const terminalTool = this.createTerminalTool({
      statusCallback: options.statusCallback,
      abortController: options.abortController
    });

    const playwrightTool = this.createPlaywrightTool({
      statusCallback: options.statusCallback,
      abortController: options.abortController,
    });

    // Create base tools object
    const tools: any = {
      // guiAgent: guiAgentTool.getToolDefinition(),
      excelAgent: excelAgent.getToolDefinition(),
      terminalAgent: terminalTool.getToolDefinition(),
      playwrightAgent: playwrightTool.getToolDefinition(),
    };

    // Only add HITL tool if both required environment variables are defined
    if (process.env.TELEGRAM_CHAT_ID && process.env.TELEGRAM_BOT_TOKEN) {
      const hitlTool = this.createHITLTool({
        statusCallback: options.statusCallback,
        abortController: options.abortController
      });
      tools.hitlTool = hitlTool.getToolDefinition();
    }

    // Add Composio tools if apps are specified
    if (options.composioApps && options.composioApps.length > 0) {
      try {
        const toolset = new VercelAIToolSet({
          "apiKey": process.env.COMPOSIO_API_KEY,
          "entityId": options.entityId,
        });

        const composioTools = toolset.getTools({ apps: options.composioApps });
        // Merge Composio tools with existing tools
        Object.assign(tools, composioTools);
        
        console.log(`Added Composio tools for apps: ${options.composioApps.join(', ')}`);
      } catch (error) {
        const errorMessage = `Failed to load Composio tools for apps [${options.composioApps.join(', ')}]: ${error.message}`;
        console.error(errorMessage, error);
        throw new Error(errorMessage);
      }
    }

    return tools;
  }

}