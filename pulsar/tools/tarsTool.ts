import { DynamicTool, StringToolOutput } from "beeai-framework/tools/base";
import { z } from "zod";
import { GUIAgent } from '@ui-tars/sdk';
import { NutJSOperator } from '@ui-tars/operator-nut-js';

const guiAgent = new GUIAgent({
  logger: undefined,
  maxLoopCount: 1,
  model: {
    baseURL: process.env.OMNI_PARSER_SERVER,
    apiKey: process.env.OMNI_PARSER_API_KEY,
    model: "tgi",
  },
  operator: new NutJSOperator(),
  onData: ({ data }) => {},
  onError: ({ data, error }) => {
    console.error({
      error: error.error,
      data: data.instruction,
    });
  },
});

// Helper function to sleep for a specified time in milliseconds
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const executorTool = new DynamicTool({
  name: "ExecutorTool",

  description: `GUI interaction tool used to perform mouse and keyboard interactions. Incase of similar elements on the screen, it expects a more verbose description in the action input.`,
  
  inputSchema: z.object({
    action: z.string().describe(`Simple actions to be performed. Example: 
      1. click the blue button with text 'Login' on linkedin page
      2. click on the linkedin search input
      3. Click on save inside the google docs page
      4. scroll, direction='down/up/right/left'
      5. wait() - Wait 5 seconds and take a screenshot
      6. hotkey(key='') - Press specified key combination
      7. click / left_double / right_single along with description
    `),
  }).required(),

  async handler(input) {
    try {
      console.log('ExecutorTool called with action:', input.action);
      
      // Pass the action to the GUI agent for execution
      const result = await guiAgent.run(input.action);
      await sleep(2000);
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