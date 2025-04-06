import { DynamicTool, StringToolOutput } from "beeai-framework/tools/base";
import { z } from "zod";
import { GUIAgent } from '@ui-tars/sdk';
import { NutJSOperator } from '@ui-tars/operator-nut-js';

const guiAgent = new GUIAgent({
  maxLoopCount: 3,
  model: {
    baseURL: "https://ti5ljwm7llwyls02.us-east-1.aws.endpoints.huggingface.cloud/v1/",
    apiKey: "***REMOVED***",
    model: "tgi",
  },
  operator: new NutJSOperator(),
  onData: ({ data }) => {
    // console.log({instruction: data.instruction})
  },
  onError: ({ data, error }) => {
    // console.error({
    //   error: error.error,
    //   data: data.instruction,
    // });
  },
});


export const executorTool = new DynamicTool({
  name: "ExecutorTool",

  // Check action space for all accepted values
  description: "Used for mouse move / click / scroll / hover actions",
  inputSchema: z.object({
    action: z.string().describe("Click on the button with text 'Submit' in the middle of the page"),
  }).required(),
  async handler(input) {
    try {
      console.log('ExecutorTool called with action:', input.action);
      await guiAgent.run(input.action);
      return new StringToolOutput(`Action ${input.action} performed successfully.`)
    } catch (error: any) {
      console.error('Error in ExecutorTool:', error);
      return new StringToolOutput("Partial action satisfied. please check the current status of the screen.")
    }
  }
});
