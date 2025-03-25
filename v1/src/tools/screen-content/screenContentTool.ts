import sharp from 'sharp';
import { z } from 'zod';
import { DynamicTool, StringToolOutput } from 'beeai-framework';
import { PlatformStrategyFactory } from '../screen/platform-strategy-factory';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import * as os from 'os';
import * as path from 'path';

const strategy = PlatformStrategyFactory.createStrategy();

export const ScreenContentTool = new DynamicTool({
  name: "ScreenContentTool",
  description: "Analyzes screen content to either find specific text or provide a summary of what's displayed",
  inputSchema: z.object({
    action: z.enum(['find', 'summarize']).describe('Action to perform: "find" to locate specific text, "summarize" to get a page summary'),
    query: z.string().optional().describe('Text to search for when using "find" action'),
    expectation: z.string().optional().describe('Description of what you expect to see on the screen or specific elements to look for')
  }),
  async handler({ action, query, expectation }) {
    // Capture screenshot using the appropriate strategy
    const tempPath = path.join(os.tmpdir(), `screenshot-${Date.now()}.png`);
    await strategy.takeScreenshot(tempPath);

    // we don't perform any spacial operations on the image
    const buffer = await sharp(tempPath)
      .jpeg({ quality: 80 })
      .toBuffer();

    let prompt = '';
    if (action === 'find' && query) {
      prompt = `Find the following text on the screen: "${query}". If found, return the text and its surrounding context. If not found, indicate that the text could not be located.`;
      
      if (expectation) {
        prompt += ` Note that I expect the following on this screen: "${expectation}". Use this context to help locate the text.`;
      }
    } else {
      prompt = 'Provide a concise summary of the content displayed on this screen.';
      
      if (expectation) {
        prompt += ` I'm specifically interested in: "${expectation}". Please focus on these elements in your summary if they are present.`;
      }
    }

    const { text } = await generateText({
      model: anthropic('claude-3-haiku-20240307'),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image',
              image: buffer,
              mimeType: 'image/jpeg',
            },
          ],
        }
      ]
    });
    
    console.log({screenContent: text});
    return new StringToolOutput(text);
  },
});

// test
// ScreenContentTool.run({ action: 'summarize' }).then(console.log).catch(console.error);