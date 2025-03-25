import { generateObject } from 'ai';
import { z } from 'zod';
import { UserMessage } from 'beeai-framework/backend/message';
import { anthropic } from '@ai-sdk/anthropic';
import type { ElementAction } from '../../../interfaces/screen-interfaces';

export interface ElementInfo {
  type: string;
  bbox: number[];
  interactivity: boolean;
  content?: string;
}

export async function getLLMPrediction(elements: ElementInfo[], userIntent: string): Promise<ElementAction> {
  const analysisPrompt = `Given the user's intent: "${userIntent}", analyze these UI elements and determine which one to interact with:

${JSON.stringify(elements, null, 2)}

Identify the most appropriate element and specify how to interact with it. Consider the element's type, position, and content.`;

  const result = await generateObject({
    model: anthropic('claude-3-haiku-20240307'),
    schema: z.object({
      action: z.string().describe('The action to perform (click, type, scroll, etc.)'),
      elementDetails: z.object({
        type: z.string(),
        bbox: z.array(z.number()).length(4),
        interactivity: z.boolean(),
        content: z.string().optional()
      }),
      reasoning: z.string().describe('Explanation for why this element and action were chosen')
    }),
    messages: [
      new UserMessage([{ type: 'text', text: analysisPrompt }])
    ]
  });

  const [x1, y1, x2, y2] = result.object.elementDetails.bbox;
  
  return {
    coordinates: [{
      center_x: Math.round((x1! + x2!) / 2),
      center_y: Math.round((y1! + y2!) / 2),
      width: Math.round(x2! - x1!),
      height: Math.round(y2! - y1!)
    }],
    action: result.object.action,
    comment: result.object.reasoning
  };
}