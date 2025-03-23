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
import { sleep } from 'bun';

const strategy = PlatformStrategyFactory.createStrategy();

// Add scaling factor retrieval
const getScalingFactor = async () => {
  // Get the scaling factor from the strategy
  const scalingFactor = 2;
  return scalingFactor || 1; // Default to 1 if not available
};

export const NextActionTool = new DynamicTool({
  name: "NextActionTool",
  description: "Analyzes the current screen state and user's intent to predict the next action with EXACT coordinates for any mouse-related interaction. ALWAYS use this tool BEFORE using InputTool for ANY operation that requires mouse movement, clicking, or dragging. After checking screen state with ScreenStateTool, use this tool to get precise coordinates for mouse interactions.",
  inputSchema: z.object({
    userIntent: z.string().describe('The task that the user wanted to accomplish ...'),
    previousActions: z.array(z.string()).optional().describe('List of actions already taken'),
  }),
  async handler({ userIntent, previousActions }) {
    await sleep(4000);
    
    // Get scaling factor early
    const scalingFactor = await getScalingFactor();
    
    // Take screenshot
    const tempPath = path.join(os.tmpdir(), `screenshot-${Date.now()}.png`);
    await strategy.takeScreenshot(tempPath);

    // Get screen dimensions
    const dimensions = await strategy.getScreenDimensions();

    // Create buffer for Claude
    const buffer = await sharp(tempPath)
      .resize({ width: 1000 })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Stage 1: Get action suggestion from Claude
    let prompt = `Based on the user's intent: "${userIntent}", analyze the current screen state`;
    
    if (previousActions?.length) {
      prompt += `\nConsidering these previous actions: ${previousActions.join(', ')}`;
    }

    prompt += '\nSuggest the next most appropriate action to take. ';
    prompt += 'Suggest actions that follow common UI patterns while considering reasonable alternatives.';
    prompt += '\nInclude specific details about where and how to perform the suggested action.';

    const { text: initialSuggestion } = await generateText({
      model: anthropic('claude-3-haiku-20240307'),
      messages: [
        new UserMessage([
          {
            type: 'text',
            text: prompt,
          },
          {
            type: 'image',
            image: buffer,
            mimeType: 'image/jpeg',
          }
        ])
      ]
    });

    // Stage 2: Use OmniParser to get element map with bounding boxes
    const processorType = ImageProcessorType.OMNIPARSER;
    
    const imageProcessor = ImageProcessorFactory.createProcessor(processorType);
    const prediction = await imageProcessor.processImage(tempPath, dimensions);
    
    const analysisPrompt = `Analyze the following screen elements and initial action suggestion to provide specific, actionable steps:

Initial Suggestion: ${initialSuggestion}

Screen Elements Map:
${prediction.output.elements}

Based on the screen elements (which have format like {'type': 'text', 'bbox': [x1, y1, x2, y2], 'interactivity': boolean, 'content': 'text'}), identify the most appropriate element to interact with and specify the action to take.`;

    const result = await generateObject({
      model: anthropic('claude-3-haiku-20240307'),
      schema: z.object({
        action: z.string().describe('The action to perform (click, type, scroll, etc.)'),
        elementDetails: z.object({
          type: z.string().describe('Element type (text, button, input, etc.)'),
          bbox: z.array(z.number()).length(4).describe('Bounding box coordinates [x1, y1, x2, y2]'),
          interactivity: z.boolean().describe('Whether the element is interactive'),
          content: z.string().optional().describe('Text content of the element if available')
        }),
        additionalParams: z.object({
          text: z.string().optional().describe('Text to type if action is typing'),
          scrollAmount: z.number().optional().describe('Amount to scroll if action is scrolling')
        }).optional()
      }),
      messages: [
        new UserMessage([
          {
            type: 'text',
            text: analysisPrompt
          }
        ])
      ]
    });

    // Convert bounding box to absolute screen coordinates
    // The bbox format is [x1, y1, x2, y2] where (x1,y1) is top-left and (x2,y2) is bottom-right
    // Modify the coordinate calculation to account for scaling factor
    const [x1, y1, x2, y2] = result.object.elementDetails.bbox;
    const absoluteCoordinates = {
      x: Math.round((x1! * dimensions.width) / scalingFactor),
      y: Math.round((y1! * dimensions.height) / scalingFactor),
      width: Math.round(((x2! - x1!) * dimensions.width) / scalingFactor),
      height: Math.round(((y2! - y1!) * dimensions.height) / scalingFactor)
    };

    const response = {
      action: result.object.action,
      elementType: result.object.elementDetails.type,
      elementContent: result.object.elementDetails.content,
      isInteractive: result.object.elementDetails.interactivity,
      coordinates: absoluteCoordinates,
      additionalParams: result.object.additionalParams
    };

    return new JSONToolOutput(response);
  },
});