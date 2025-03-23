import sharp from 'sharp';
import { z } from 'zod';
import { DynamicTool, StringToolOutput } from 'beeai-framework';
import { PlatformStrategyFactory } from '../screen/platform-strategy-factory';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import * as os from 'os';
import * as path from 'path';
import { UserMessage } from 'beeai-framework/backend/message';

const strategy = PlatformStrategyFactory.createStrategy();

export const ScreenStateTool = new DynamicTool({
  name: "ScreenStateTool",
  description: "Takes a screenshot and provides a brief description of what's visible on the screen",
  inputSchema: z.object({}),
  async handler() {
    const tempPath = path.join(os.tmpdir(), `screenshot-${Date.now()}.png`);
    await strategy.takeScreenshot(tempPath);

    const buffer = await sharp(tempPath)
      .jpeg({ quality: 70 })
      .toBuffer();

    const prompt = 'Provide a brief, simple description of what is visible on this screen.';

    const { text } = await generateText({
      model: anthropic('claude-3-haiku-20240307'),
      messages: [
        new UserMessage([
          { type: 'text', text: prompt },
          { type: 'image', image: buffer, mimeType: 'image/jpeg' }
        ])
      ]
    });

    return new StringToolOutput(text);
  },
});