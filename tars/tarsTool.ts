import { DynamicTool, StringToolOutput } from "beeai-framework/tools/base";
import { z } from "zod";
import { GUIAgent } from '@ui-tars/sdk';
import { NutJSOperator } from '@ui-tars/operator-nut-js';

const guiAgent = new GUIAgent({
  model: {
    baseURL: "https://ti5ljwm7llwyls02.us-east-1.aws.endpoints.huggingface.cloud/v1/",
    apiKey: "***REMOVED***",
    model: "tgi",
  },
  operator: new NutJSOperator(),
  onData: ({ data }) => {
    console.log({instruction: data.instruction})
  },
  onError: ({ data, error }) => {
    console.error({
      error: error.error,
      data: data.instruction,
    });
  },
});


export const executorTool = new DynamicTool({
  name: "ExecutorTool",
  description: "Action to perform by the user",
  inputSchema: z.object({
    action: z.string().describe("Action to perform, for example click on whatsapp search input."),

    interactionHistory: z.string().describe("History of previous actions performed by the user."),
  }).required(),
  async handler(input) {
    try {
      console.log('ExecutorTool called with action:', input.action);
      await guiAgent.run(input.action + '\n\n here is a list of past actions that were taken: ' + input.interactionHistory);
      return new StringToolOutput(`Action ${input.action} performed successfully.`)
    } catch (error: any) {
      console.error('Error in ExecutorTool:', error);
      return new StringToolOutput("Partial action satisfied. please check the current status of the screen.")
    }
  }
});
