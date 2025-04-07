import { DynamicTool, StringToolOutput } from "beeai-framework/tools/base";
import { z } from "zod";
import { GUIAgent } from '@ui-tars/sdk';
import { NutJSOperator } from '@ui-tars/operator-nut-js';

const guiAgent = new GUIAgent({
  maxLoopCount: 1,
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

  description: `GUI interaction tool used to perform mouse and keyboard interactions. Incase of similar elements on the screen, it expects a more verbose description in the action input.`,
  
  inputSchema: z.object({
    action: z.string().describe(`Simple actions to be performed. Example: click on the button with text 'Login' or click on the linkedin search input. Scroll down`),
  }).required(),

  async handler(input) {
    try {
      console.log('ExecutorTool called with action:', input.action);
      
      // Pass the action to the GUI agent for execution
      const result = await guiAgent.run(input.action);
      
      // Return success message with action details
      return new StringToolOutput(`Action: <${input.action}> performed successfully.`)
    } catch (error: any) {
      console.error('Error in ExecutorTool:', error);
      
      // Enhanced error feedback
      const errorMessage = error.message || String(error);
      const isElementNotFound = errorMessage.includes('not found') || errorMessage.includes('could not locate');
      
      if (isElementNotFound) {
        return new StringToolOutput(
          `Could not find the specified element. Please check if the element exists, is visible, or if you need to scroll to reveal it. Exact error: ${errorMessage}`
        );
      }
      
      return new StringToolOutput(
        `Action partially completed or failed. Current screen status may have changed. Error: ${errorMessage}`
      );
    }
  }
});


// executorTool.run({
//   action: 'scroll down the firefox webpage slightly'
// }).then(console.log).catch(err => {
//   console.error(err);
// });