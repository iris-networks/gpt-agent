import { detectElements } from './api';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import type { ImageProcessor, MatchingElement } from '../../../../interfaces/screen-interfaces';
import { PlatformStrategyFactory } from '../../platform-strategy-factory';
import { UserMessage } from 'beeai-framework/backend/message';

export class OcularProcessor implements ImageProcessor {
  async getMatchingElement(input: { userIntent?: string; summary?: string; helpText?: string; }, buffer: Buffer): Promise<string> {
    const platformStrategy = PlatformStrategyFactory.createStrategy();
    const dims = await platformStrategy.getScreenDimensions();
    const response = await detectElements(buffer, dims);
    
    // The response now directly contains the structured output as a string and the image URL
    const structuredOutput = response.output;
    const imageUrl = response.image_url;
    
    // Fetch the image for visual analysis
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    const base64Image = imageBuffer.toString('base64');
    const dataUri = `data:image/png;base64,${base64Image}`;

    // Construct a prompt that includes the user intent and the structured output from the API
    const prompt = `You are an AI agent that has access to a screenshot and it has access to all the elements and coordinates on the screen. You also know what the user is trying to do and the summary of all the past actions. Now based off all of these information, you are supposed to give me one string which will be a command that is the next action that has to be taken and why. Now if the next action requires you to click on some coordinates then you should mention what coordinates to click on. We have annotated the image for you to be able to uniquely identify any element on the screen. We have annotated a few elements on the screen so that you can use those codes to uniquely identify if there are multiple elements that meet the requirement. 
    
    user intent: ${input.userIntent}
    summary: ${input.summary}
    help text: ${input.helpText}
    icons / text on screen and their coordinates: ${structuredOutput}

    Now tell me what action to take next and why.
    `;

    const {text} = await generateText({
      model: anthropic('claude-3-5-haiku-latest'),
      messages: [
        new UserMessage([
          {
            "type": "text",
            "text": prompt
          },
          {
            "type": "image",
            "image": dataUri,
            "mimeType": "image/png"
          }
        ]),
      ]
    });

    return text;
  }
}