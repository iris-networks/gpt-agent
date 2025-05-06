import { tool } from 'ai';
import { z } from 'zod';
import { GUIAgent } from '@ui-tars/sdk';
import { Operator } from '@ui-tars/sdk/dist/core';
import { UITarsModel, UITarsModelConfig } from '@ui-tars/sdk/dist/Model';
import { UITarsModelVersion } from '@ui-tars/shared/constants';
import { getSystemPromptV1_5 } from './prompts';
import { Conversation, StatusEnum } from '@ui-tars/shared/types';
import { notify } from 'node-notifier';

export function createGuiAgentTool(options: {
  abortController: AbortController;
  config: UITarsModel | UITarsModelConfig;
  operator: Operator;
  timeout: number;
}) {
  return tool({
    description: `Executes complex GUI automation tasks using natural language. This tool can perform multi-step web tasks like "go to LinkedIn, search for a person named John Smith, and send them a connection request" as a single instruction. When sending messages, writing posts, or inputting text, always provide the exact content to be typed as part of your command. 
    
    Example input to this tool: {
      "commands": "goto facebook.com, search for Ara, send her a message: Hi! How are you ?",
      "rules": "Do not send message if last seen was more than 6 hours ago."
    }`,

    parameters: z.object({
      rules: z.string().optional().describe('rules / identities of the agent, dos and donts'),
      commands: z.string().describe('Natural language description of GUI tasks to perform.')
    }),
    "execute": async ({ commands, rules }) => {
      commands += `
        ${rules ? rules : ''}
      `
      console.log("received command ", commands)
      let conversations: Conversation[] = [];


      const guiAgent = new GUIAgent({
        loopIntervalInMs: 100,
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
          conversations = conversations.concat(data.conversations);
        },
        onError: ({ data, error: err }) => {
          console.error(err);
        },
        uiTarsVersion: UITarsModelVersion.V1_5,
        signal: options.abortController.signal,
      });

      await guiAgent.run(commands);


      const response = conversations[conversations.length - 1].value.replace("Thought: ", "");
      return response;
    }
  });
}