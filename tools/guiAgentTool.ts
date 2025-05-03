import { tool } from 'ai';
import { z } from 'zod';
import { GUIAgent } from '@ui-tars/sdk';
import { Operator } from '@ui-tars/sdk/dist/types';
import { UITarsModel, UITarsModelConfig } from '@ui-tars/sdk/dist/Model';
import { DEFAULT_CONFIG } from '@app/shared/constants';
import { DefaultBrowserOperator } from '@ui-tars/operator-browser';
import { UITarsModelVersion } from '@ui-tars/shared/constants';
import { getSystemPromptV1_5 } from './prompts';

export function createGuiAgentTool(options: {
  abortController: AbortController;
  config?: UITarsModel | UITarsModelConfig;
  operator: Operator;
  timeout: number;
}) {

  return tool({
    description: 'Execute GUI automation commands using natural language. Ideal for automating browser or desktop actions.',
    parameters: z.object({
      command: z.string().describe('Natural language description of GUI action to perform (e.g., "open gmail", "add receipient as john")')
    }),
    execute: async ({ command }) => {
      let result = '';
      const guiAgent = new GUIAgent({
        systemPrompt: getSystemPromptV1_5('en', 'normal'),
        model: {
          "apiKey": DEFAULT_CONFIG.VLM_API_KEY,
          "model": "tgi",
          "baseURL": DEFAULT_CONFIG.VLM_BASE_URL,
        },
        operator: options.operator,
        onData: ({ data }) => {
          result += data.conversations.map(cv => cv.value).join('\n')
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