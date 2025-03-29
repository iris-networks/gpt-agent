import { generateObject } from 'ai';
import { z } from 'zod';
import { UserMessage } from 'beeai-framework/backend/message';
import { anthropic } from '@ai-sdk/anthropic';
import Replicate from 'replicate';

export interface ElementInfo {
  type: string;
  bbox: number[];
  interactivity: boolean;
  content?: string;
}

export interface OmniParserResponse {
  img: string;
  elements: string;
}

// update the normalized coordinates to the real coordinates
export async function detectElements(buffer: Buffer, dims: {
  width: number;
  height: number;
  scalingFactor: number;
}): Promise<{
  output: string
  image_url: string
}> {
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  let prediction = await replicate.deployments.predictions.create(
    'codebanesr',
    'omniparser',
    {
      input: {
        image: imagePath
      }
    }
  );

  prediction = await replicate.wait(prediction);
  
  // Parse the elements string into an array of elements
  const elements: OmniParserElement[] = [];
  const elementLines = (prediction.output as OmniParserResponse).elements.split('\n');
  
  elementLines.forEach(line => {
    if (line.trim()) {
      const match = line.match(/icon \d+: (.+)/);
      if (match) {
        try {
          // @ts-ignore
          const elementData = JSON.parse(match[1].replace(/'/g, '"'));
          elements.push({
            type: elementData.type,
            bbox: elementData.bbox,
            interactivity: ['button', 'input', 'link'].includes(elementData.type.toLowerCase()),
            content: elementData.content
          });
        } catch (e) {
          console.error('Failed to parse element:', line);
        }
      }
    }
  });

  return elements;
}