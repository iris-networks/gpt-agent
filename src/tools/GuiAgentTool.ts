import { tool } from 'ai';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { BaseTool } from './base/BaseTool';
import { Operator, StatusEnum, UITarsModel, UITarsModelConfig } from '@app/packages/ui-tars/sdk/src/core';
import { Conversation, UITarsModelVersion } from '@app/packages/ui-tars/shared/src/types';
import { GUIAgent } from '@app/packages/ui-tars/sdk/src/GUIAgent';
import { AgentStatusCallback } from '../agent_v2/types';
import { getSystemPromptV1_5 } from '@app/prompts';

interface GuiAgentToolOptions {
  statusCallback: AgentStatusCallback;  // MANDATORY
  abortController: AbortController;     // MANDATORY
  config: UITarsModel | UITarsModelConfig;
  operator: Operator;
  timeout: number;
  onScreenshot?: (base64: string, conversation: Conversation) => void;
}

@Injectable()
export class GuiAgentTool extends BaseTool {
  private config: UITarsModel | UITarsModelConfig;
  private operator: Operator;
  private timeout: number;
  private onScreenshot?: (base64: string, conversation: Conversation) => void;
  private lastScreenshot: string | null = null;

  constructor(options: GuiAgentToolOptions) {
    super({
      statusCallback: options.statusCallback,
      abortController: options.abortController
    });
    
    this.config = options.config;
    this.operator = options.operator;
    this.timeout = options.timeout;
    this.onScreenshot = options.onScreenshot;
  }

  /**
   * Execute GUI command with status updates
   */
  private async executeGuiCommand(command: string, isLeftDouble: boolean): Promise<string> {
    this.emitStatus(`Starting GUI command: ${command}`, StatusEnum.RUNNING);
    
    let conversations: Conversation[] = [];

    if (isLeftDouble) {
      command += " use left_double mouse click";
      this.emitStatus(`Modified command for double-click: ${command}`, StatusEnum.RUNNING);
    }

    const guiAgent = new GUIAgent({
      loopIntervalInMs: 1000,
      maxLoopCount: 3,
      systemPrompt: getSystemPromptV1_5(
        'en', 
        'normal', 
        this.operator.constructor.name.toLowerCase().includes('browser') ? 'browser' : undefined
      ),
      // @ts-ignore
      model: this.config,
      operator: this.operator,
      onData: async ({ data }) => {
        if (data.status === StatusEnum.CALL_USER) {
          this.emitStatus("GUI Agent triggered call user", StatusEnum.RUNNING);
        }

        data.conversations.forEach((conversation) => {
          // If we get a screenshot, store it for the next prediction
          if (conversation.screenshotBase64) {
            this.lastScreenshot = conversation.screenshotBase64;
            this.emitStatus("Screenshot captured", StatusEnum.RUNNING);
          }
          
          // If we have predictions and a stored screenshot, call onScreenshot with the conversation
          if (conversation.predictionParsed && conversation.predictionParsed.length > 0 && this.lastScreenshot && this.onScreenshot) {
            this.onScreenshot(this.lastScreenshot, conversation);
            this.lastScreenshot = null; // Clear after using
            this.emitStatus("Screenshot processed with predictions", StatusEnum.RUNNING);
          }

          // Emit status for each conversation step
          if (conversation.from === 'gpt' && conversation.value.startsWith('Thought:')) {
            const thought = conversation.value.replace('Thought: ', '').trim();
            this.emitStatus(`GUI Agent thinking: ${thought}`, StatusEnum.RUNNING);
          }
        });

        conversations = conversations.concat(data.conversations);
      },
      onError: ({ data, error: err }) => {
        // this.emitStatus(`GUI Agent error: ${err.message}`, StatusEnum.ERROR, { error: err });
        console.error(err);
      },
      uiTarsVersion: UITarsModelVersion.V1_5,
      signal: this.abortController.signal,
    });

    try {
      this.emitStatus("Executing GUI command...", StatusEnum.RUNNING);
      await guiAgent.run(command);
      this.emitStatus("GUI command completed successfully", StatusEnum.RUNNING);
    } catch (e) {
      this.emitStatus(`GUI command failed: ${e.message}`, StatusEnum.ERROR, { error: e });
      console.error("[GuiAgentError]", e);
    }

    // Collect all 'Thought:' entries from GPT across the conversation history
    const allThoughts = conversations
      .filter(conv => conv.from === 'gpt' && conv.value.startsWith('Thought:'))
      .map(conv => conv.value.replace('Thought: ', '').trim());

    // Combine all thoughts with numbering (1, 2, 3, ...)
    const numberedThoughts = allThoughts.map((thought, index) =>
      `${index + 1}. ${thought}`
    );

    // Join the numbered thoughts with line breaks
    const combinedResponse = numberedThoughts.join('\n\n');
    
    this.emitStatus(`GUI command finished with ${allThoughts.length} thoughts`, StatusEnum.RUNNING);
    return combinedResponse || '';
  }

  /**
   * Get the AI SDK tool definition
   */
  getToolDefinition() {
    return tool({
      description: `Natural language command to perform some gui action, should be called if task cannot be accomplished by the terminalAgent`,
      parameters: z.object({
        command: z.string().max(500).describe('The thing that you want to do'),
        is_left_double: z.boolean().default(false).describe('Actions that require double click, should be true, example: opening an app on desktop'),
      }),
      execute: async ({ command, is_left_double }) => {
        return this.executeGuiCommand(command, is_left_double);
      }
    });
  }
}