import sharp from 'sharp';
import { z } from 'zod';
import { DynamicTool, JSONToolOutput } from 'beeai-framework';
import { PlatformStrategyFactory } from '../screen/platform-strategy-factory';
import { anthropic } from '@ai-sdk/anthropic';
import { generateObject, generateText } from 'ai';
import * as os from 'os';
import * as path from 'path';
import { UserMessage } from 'beeai-framework/backend/message';
import { ImageProcessorFactory } from '../screen/image-processors';
import { ImageProcessorType } from '../../interfaces/screen-interfaces';

const strategy = PlatformStrategyFactory.createStrategy();

export const NextToolInput = z.object({
  userIntent: z.string().describe('The exact task the user asked the ai agent to complete.'),
  previousActions: z.array(z.string()).optional().describe('List of actions already taken so far'),
});

export const NextActionTool = new DynamicTool({
  name: "NextActionTool",
  description: "Analyzes the current screen state and user's intent to predict the next action with EXACT coordinates for any mouse-related interaction. ALWAYS use this tool BEFORE using CommandExecutorTool for ANY operation that requires mouse movement, clicking, or dragging. After checking screen state with ScreenStateTool, use this tool to get precise coordinates for mouse interactions.",
  inputSchema: NextToolInput,
  async handler(input) {
    const tempPath = path.join(os.tmpdir(), `screenshot-${Date.now()}.png`);
    await strategy.takeScreenshot(tempPath);
    const response = {
      reasoning: 'No action needed',
      action: 'none',
      coordinates: { x: 0, y: 0 },
    };

    // Get screen dimensions
    const dimensions = await strategy.getScreenDimensions();

    // Create buffer for Claude
    const buffer = await sharp(tempPath)
      .jpeg({ quality: 85 })
      .toBuffer();


    // Stage 2: Use OmniParser to get element map with bounding boxes
    const processorType = process.env.PROCESSOR_TYPE || ImageProcessorType.OMNIPARSER;

    // @ts-expect-error
    const imageProcessor = ImageProcessorFactory.createProcessor(processorType);
    const prediction = await imageProcessor.getMatchingElement(input, buffer);

    // Convert normalized bounding box to center x,y coordinates
    if (prediction && prediction.normalized_bbox && dimensions) {
      const [x1, y1, x2, y2] = prediction.normalized_bbox;
      const centerX = Math.round(((x1! + x2!) / 2) * dimensions.width) / dimensions.scalingFactor;
      const centerY = Math.round(((y1! + y2!) / 2) * dimensions.height) / dimensions.scalingFactor;

      response.action = prediction.action;

      // @ts-ignore
      response.reasoning = prediction.reasoning; // Add reasoning here..
      response.coordinates = { 
        x: Math.round(centerX), 
        y: Math.round(centerY) 
      };
    }

    return new JSONToolOutput(response);
  },
});


// {\"id\":\"icon 17\",\"type\":\"text\",\"normalized_bbox\":[0.32089120149612427,0.18576544523239136,0.49276620149612427,0.20188003778457642],\"action\":\"click\",\"reasoning\":\"The user's intent is to \\\"Click on Firefox address bar to enter URL\\\". The element with ID \\\"icon 17\\\" has the content \\\"Search with DuckDuckGo or enter address\\\", which is the address bar in the Firefox browser. This element is the best match for the user's intent to click the address bar to enter a URL. The element is also visually prominent in the center of the browser window.\",\"confidence\":0.95}