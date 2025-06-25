import { tool } from 'ai';
import { z } from 'zod';
// import { Operator, UITarsModel, UITarsModelConfig } from '@ui-tars/sdk/dist/core';
import { getSystemPromptV1_5 } from './prompts';
import { notify } from 'node-notifier';
import { Operator, StatusEnum, UITarsModel, UITarsModelConfig } from '@app/packages/ui-tars/sdk/src/core';
import { Conversation, UITarsModelVersion } from '@app/packages/ui-tars/shared/src/types';
import { GUIAgent } from '@app/packages/ui-tars/sdk/src/GUIAgent';

export function createGuiAgentTool(options: {
  abortController: AbortController;
  config: UITarsModel | UITarsModelConfig;
  operator: Operator;
  timeout: number;
  onScreenshot?: (base64: string, conversation: Conversation) => void; // Callback for screenshots with conversation data
}) {
  // Store the last screenshot to pair with upcoming predictions
  let lastScreenshot: string | null = null;
  return tool({
    description: `Executes focused GUI automation tasks using natural language. This tool performs sequential actions on a single page. Each command should describe the intent or goal rather than specific UI actions. Commands should be simple and under 500 characters.
    
    Example input to this tool: 
    Example 1 (navigating to a website):
    {
      "command": "Navigate to YouTube website"
    }

    Example 2 (opening a specific link):
    {
      "commands": "Open the YouTube link from search results"
    }

    Example 5 (replying to a comment):
    {
      "command": "Reply to the comment with text: 'Extreme request to alakh sir, please .. (truncated...)' with message 'this is great!'"
    }

    Example 6 (searching and selecting users):
    {
      "command": "Search for 'ali' on LinkedIn and select the most appropriate result"
    }

    When sending commands to click, make sure to say exactly which one: left_click, left_single, double_click, left_double, right_click
    `,

    parameters: z.object({
      command: z.string().max(500).describe('Intent or goal to accomplish on this screen')
    }),
    execute: async ({ command }) => {
      console.log("received command ", command)
      let conversations: Conversation[] = [];

      const guiAgent = new GUIAgent({
        loopIntervalInMs: 1000,
        maxLoopCount: 3,
        systemPrompt: getSystemPromptV1_5('en', 'normal', options.operator.constructor.name.toLowerCase().includes('browser') ? 'browser' : undefined),

        // @ts-ignore
        model: options.config,
        operator: options.operator,
        onData: async ({ data }) => {
          if (data.status === StatusEnum.CALL_USER) {
            console.log("[guiAgent] triggered call user")
          }

          data.conversations.forEach((conversation) => {
            // If we get a screenshot, store it for the next prediction
            if (conversation.screenshotBase64) {
              lastScreenshot = conversation.screenshotBase64;
            }
            
            // If we have predictions and a stored screenshot, call onScreenshot with the conversation
            if (conversation.predictionParsed && conversation.predictionParsed.length > 0 && lastScreenshot && options.onScreenshot) {
              options.onScreenshot(lastScreenshot, conversation);
              lastScreenshot = null; // Clear after using
            }
          });

          conversations = conversations.concat(data.conversations);
        },
        onError: ({ data, error: err }) => {
          console.error(err);
        },
        uiTarsVersion: UITarsModelVersion.V1_5,
        signal: options.abortController.signal,
      });

      try {
        await guiAgent.run(command);
      } catch(e) {
        console.error("[GuiAgentError]")
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
      return combinedResponse || '';
    }
  });
}