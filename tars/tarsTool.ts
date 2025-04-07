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

  description: `Comprehensive GUI interaction tool supporting all ui element, Always include position context and visual descriptors`,
  
  inputSchema: z.object({
    action: z.string().describe(`The gui action to perform, click, type, scroll and necessary context to uniquely identify the element to be interacted with. Always include position context and visual descriptors, e.g., "the blue 'Post Comment' button at bottom-right" not just "the button".`),
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