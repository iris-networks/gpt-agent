import { z } from 'zod';
import { DynamicTool, StringToolOutput } from 'beeai-framework';
import { PlatformStrategyFactory } from '../screen/platform-strategy-factory';
import * as os from 'os';
import * as path from 'path';
import { ImageProcessorFactory } from '../screen/image-processors';
import * as fs from 'fs/promises';

const strategy = PlatformStrategyFactory.createStrategy();

export const NextToolInput = z.object({
  userIntent: z.string().describe('The exact task the user asked the ai agent to complete.'),
  previousActions: z.array(z.string()).optional().describe('List of actions already taken so far'),
});

export const NextActionTool = new DynamicTool({
  name: "NextActionTool",
  description: "Finds the next best action to take to meet the users goal. Always called before making a decision.",
  inputSchema: NextToolInput,
  async handler(input) {
    const tempPath = path.join(os.tmpdir(), `screenshot-${Date.now()}.png`);
    await strategy.takeScreenshot(tempPath);
    
    // Read the screenshot file into a buffer
    const buffer = await fs.readFile(tempPath);
    
    const imageProcessor = await ImageProcessorFactory.createProcessor();
    const result = await imageProcessor.getMatchingElement(input, buffer);
      
    return new StringToolOutput(result);
  },
});