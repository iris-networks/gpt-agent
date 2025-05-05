import { tool } from 'ai';
import { z } from 'zod';
import { GUIAgent } from '@ui-tars/sdk';
import { Operator } from '@ui-tars/sdk/dist/core';
import { UITarsModel, UITarsModelConfig } from '@ui-tars/sdk/dist/Model';
import { UITarsModelVersion } from '@ui-tars/shared/constants';
import { getSystemPromptV1_5 } from './prompts';
import { Conversation } from '@ui-tars/shared/types';

export function createGuiAgentTool(options: {
  abortController: AbortController;
  config: UITarsModel | UITarsModelConfig;
  operator: Operator;
  timeout: number;
}) {
  return tool({
    description: 'Execute GUI automation commands using natural language. Can execute multiple gui actions in single command.',
    parameters: z.object({
      command: z.string().describe('Natural language description of GUI action to perform. Takes upto 6 gui instructions at a time.'),
    }),
    "execute": async ({ command }) => {
      console.log("received command ", command)
      let conversations:Conversation[] = [];
      const guiAgent = new GUIAgent({
        loopIntervalInMs: 1000,
        maxLoopCount: 6,
        systemPrompt: getSystemPromptV1_5('en', 'normal'),
        model: options.config,
        operator: options.operator,
        onData: ({ data }) => {
          conversations = conversations.concat(data.conversations);
        },
        onError: ({ data, error: err }) => {
          console.error(err);
        },
        uiTarsVersion: UITarsModelVersion.V1_5,
        signal: options.abortController.signal,
      });

      await guiAgent.run(command)

      const response = conversations[conversations.length-1].value.replace("Thought: ", "");
      return response;
    }
  });
}