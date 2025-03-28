import sharp from 'sharp';
import { z } from 'zod';
import { DynamicTool, JSONToolOutput, StringToolOutput } from 'beeai-framework';
import { PlatformStrategyFactory } from '../screen/platform-strategy-factory';
import * as os from 'os';
import * as path from 'path';
import { ImageProcessorFactory } from '../screen/image-processors';
import { ImageProcessorType } from '../../interfaces/screen-interfaces';

const strategy = PlatformStrategyFactory.createStrategy();

export const NextToolInput = z.object({
  userIntent: z.string().describe('The exact task the user asked the ai agent to complete.'),
  previousActions: z.array(z.string()).optional().describe('List of actions already taken so far'),
});

export const NextActionTool = new DynamicTool({
  name: "NextActionTool",
  description: "Analyzes the current screen state and user's intent to predict the next action with EXACT coordinates for any mouse-related interaction. Returns a structured JSON with precise coordinates and element information. ALWAYS use this tool BEFORE using CommandExecutorTool for ANY operation that requires mouse movement, clicking, or dragging.",
  inputSchema: NextToolInput,
  async handler(input) {
    const tempPath = path.join(os.tmpdir(), `screenshot-${Date.now()}.png`);
    await strategy.takeScreenshot(tempPath);
    
    // Create buffer for Claude
    const buffer = await sharp(tempPath)
      .jpeg({ quality: 85 })
      .toBuffer();

    const imageProcessor = await ImageProcessorFactory.createProcessor();
    const result = await imageProcessor.getMatchingElement(input, buffer);
      
    return new StringToolOutput(result);
  },
});