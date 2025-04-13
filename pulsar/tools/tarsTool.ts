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
  onData: ({ data }) => {
    // const prediction = data?.conversations?.[data.conversations.length - 1]?.predictionParsed?.[0];

    // const {action_type, action_inputs} = prediction || {};

    // if(action_type === 'click') {
    //   const {start_coords} = action_inputs!;
    //   console.log('Clicking at:', start_coords);
    // }
  },
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
    action: z.string().describe(`Mouse / keyboard actions / wait to be performed. Example: 
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
      await sleep(3000);
      return new StringToolOutput(`Action: <${input.action}> performed successfully.`)
    } catch (error: any) {
      console.error('Error in ExecutorTool:', error);
      
      return new StringToolOutput(
        `Action partially completed or failed. Please replan`
      );
    }
  }
});