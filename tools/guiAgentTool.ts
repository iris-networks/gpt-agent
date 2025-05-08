import { tool } from 'ai';
import { z } from 'zod';
import { GUIAgent } from '@ui-tars/sdk';
import { Operator } from '@ui-tars/sdk/dist/core';
import { UITarsModel, UITarsModelConfig } from '@ui-tars/sdk/dist/Model';
import { UITarsModelVersion } from '@ui-tars/shared/constants';
import { getSystemPromptV1_5 } from './prompts';
import { Conversation, PredictionParsed, StatusEnum } from '@ui-tars/shared/types';
import { notify } from 'node-notifier';

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
    description: `Executes focused GUI automation tasks using natural language. This tool performs sequential actions on a single page. Each command should be simple and under 500 characters. The tool will execute commands one by one in order.
    
    Example input to this tool: 
    Example 1 (where you don't have to wait for search results to appear, its decisive):
    {
      "command": "type youtube.com in google search bar and press enter",
    }"

    Example 2:
    {
      "commands": "Click on the link 'https://www.youtube.com' in the search result (prefer giving link for better action)"
    }

    Example 5 (Clicking a specific comment's reply button) don't quote the entire comment, just part of it enough for us to identify the comment, truncate if too long:
    {
      "command": "click on reply button for the comment with text: 'Extreme request to alakh sir, please .. (truncated...)', and type 'this is great!'"
    }

    Example 6 (Detailed search and selection) to find and add products to a cart, searching for users on a social media site and so on:
    {
      "command": "click on linkedin search bar, type ali and wait for results to show up. the click on the most appropriate result."
    }
    
    Example 7 (to center contents on the screen and maybe more):
    {
      "command": "Bring the post from arlan to the center of the screen so post button is visible"
    }
    `,

    parameters: z.object({
      command: z.string().max(500).describe('Instruction for the next action to take on this screen')
    }),
    execute: async ({ command }) => {
      console.log("received command ", command)
      let conversations: Conversation[] = [];

      const guiAgent = new GUIAgent({
        loopIntervalInMs: 1000,
        maxLoopCount: 6,
        systemPrompt: getSystemPromptV1_5('en', 'normal'),
        model: options.config,
        operator: options.operator,
        onData: async ({ data }) => {
          if (data.status === StatusEnum.CALL_USER) {
            await new Promise<void>((resolve) => {
              const notification = notify({
                type: 'info',
                wait: true,
                title: data.instruction,
                message: "unable to continue"
              }, (err, response, metadata) => {
                resolve();
              });

              console.log(notification)
            });
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

      await guiAgent.run(command).catch(console.error);

      const response = conversations[conversations.length - 1].value.replace("Thought: ", "");
      return response;
    }
  });
}