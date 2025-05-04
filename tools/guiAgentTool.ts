import { tool } from 'ai';
import { z } from 'zod';
import { GUIAgent } from '@ui-tars/sdk';
import { Operator } from '@ui-tars/sdk/dist/types';
import { UITarsModel, UITarsModelConfig } from '@ui-tars/sdk/dist/Model';
import { UITarsModelVersion } from '@ui-tars/shared/constants';
import { getSystemPromptV1_5 } from './prompts';

export function createGuiAgentTool(options: {
  abortController: AbortController;
  config: UITarsModel | UITarsModelConfig;
  operator: Operator;
  timeout: number;
}) {
  return tool({
    description: 'Execute GUI automation commands using natural language. Ideal to perform multiple keyboard and mouse actions.',
    parameters: z.object({
      command: z.string().describe('Natural language description of GUI action to perform (e.g., "open gmail, compose a new email and add john as recipient"')
    }),
    "execute": async ({ command }) => {
      console.log("received command ", command)
      let result = '';
      const guiAgent = new GUIAgent({
        systemPrompt: getSystemPromptV1_5('en', 'normal'),
        model: options.config,
        operator: options.operator,
        onData: ({ data }) => {
          result += data.conversations.filter(cv => {
            return cv.from == "gpt"
          }).map(cv => cv.value).join('\n')
        },
        onError: ({ data, error: err }) => {
          console.error(err);
        },
        uiTarsVersion: UITarsModelVersion.V1_5,
        signal: options.abortController.signal,
      });

      await guiAgent.run(command);

      return {
        success: true,
        result: result,
      };
    }
  });
}