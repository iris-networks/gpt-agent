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
  description: "Analyzes the current state of the screen to describe UI elements, verify actions, and detect changes",
  inputSchema: z.object({
    action: z.enum(['describe', 'verify']).describe('Action to perform: "describe" to get detailed UI state, "verify" to check if an expected element exists'),
    expectedState: z.string().optional().describe('Description of expected state when using "verify" action'),
    focusArea: z.string().optional().describe('Description of specific area to focus on (e.g., "top menu", "sidebar", "dialog box", "header", "footer", "body", "navigation", "main content", "form", "button area", "search bar")')
  }),
  async handler({ action, expectedState, focusArea }) {
    // Capture screenshot using the appropriate strategy
    const tempPath = path.join(os.tmpdir(), `screenshot-${Date.now()}.png`);
    await strategy.takeScreenshot(tempPath);

    // Process the image with low detail settings
    const width = 600;
    const quality = 70;

    const buffer = await sharp(tempPath)
      .resize({ width })
      .jpeg({ quality })
      .toBuffer();

    let prompt = '';

    // Build the appropriate prompt based on the action
    if (action === 'describe') {
      prompt = `Describe the current state of the screen${focusArea ? ` focusing on the ${focusArea}` : ''}. `;
      prompt += 'Provide a brief overview of the main elements visible.';
    } else if (action === 'verify' && expectedState) {
      prompt = `Verify if the following expected state is visible on the screen: "${expectedState}". `;
      prompt += 'If it matches, confirm the match and describe what you see. If it doesn\'t match, explain what\'s different.';
    }

    const { text } = await generateText({
      model: anthropic('claude-3-haiku-20240307'),
      messages: [
        new UserMessage(
          [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image',
              image: buffer,
              mimeType: 'image/jpeg',
            },

          ]
        )
      ]
    });

    return new StringToolOutput(text);
  },
});