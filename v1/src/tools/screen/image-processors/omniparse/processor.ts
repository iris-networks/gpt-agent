import Replicate from "replicate";
import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { UserMessage } from 'beeai-framework/backend/message';
import { z } from 'zod';
import { ElementAction } from '../ocular/types';
import type { ImageProcessor, MatchingElement } from '../../../../interfaces/screen-interfaces';
import type { OmniParseElement, OmniParseOutput } from "./types";

export class OmniParserProcessor implements ImageProcessor {
  async getMatchingElement(
    input: { userIntent?: string; summary?: string; helpText?: string; },
    buffer: Buffer
  ): Promise<MatchingElement | null> {
    // Initialize Replicate client
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // Call the Omniparse model via Replicate
    let prediction = await replicate.deployments.predictions.create(
      "codebanesr",
      "omniparser",
      {
        input: {
          image: `data:image/jpeg;base64,${buffer.toString('base64')}`
        }
      }
    );

    // Wait for the prediction to complete
    prediction = await replicate.wait(prediction);
    const output = prediction.output;
    const annotatedImageUrl = output.img;

    // Parse the elements into a usable format
    // Each line looks like: icon 0: {'type': 'text', 'bbox': [...], 'interactivity': False, 'content': 'Firefox'}
    const parsedElements = this.parseElementsOutput(output);

    // Use Claude to determine which element best matches the user's intent
    const targetElement = await this.findMatchingElement(parsedElements, input.userIntent || '', annotatedImageUrl);

    return targetElement;
  }

  private parseElementsOutput(output: OmniParseOutput): OmniParseElement[] {
    const parsedElements: OmniParseElement[] = [];
    const { elements, img } = output;
    const lines = elements.split("\n");

    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        // Extract the ID from icon number
        const idMatch = line.match(/icon (\d+):/);
        if (!idMatch) continue;

        const id = `icon ${idMatch[1]}`;

        // Extract the dictionary-like object 
        const objectMatch = line.match(/icon \d+: (.+)/);
        if (!objectMatch) continue;

        // Parse the Python-like dictionary more carefully
        const dictStr = objectMatch[1].trim();
        
        // Extract each property manually
        const typeMatch = dictStr.match(/'type':\s*'([^']+)'/);
        const bboxMatch = dictStr.match(/'bbox':\s*(\[[^\]]+\])/);
        const interactivityMatch = dictStr.match(/'interactivity':\s*(True|False)/i);
        
        // Match content allowing for escaped quotes and any characters
        const contentMatch = dictStr.match(/'content':\s*'([^']*(?:\'[^']*)*)'/) || 
                             dictStr.match(/'content':\s*"([^"]*(?:\"[^"]*)*)"/) ||
                             dictStr.match(/'content':\s*'(.*)'/);

        if (!typeMatch || !bboxMatch) continue;

        const type = typeMatch[1];
        const bbox = JSON.parse(bboxMatch[1].replace(/'/g, '"'));
        const interactivity = interactivityMatch ? 
                             interactivityMatch[1].toLowerCase() === 'true' : 
                             false;
        const content = contentMatch ? contentMatch[1] : '';

        parsedElements.push({
          id,
          type,
          bbox,
          interactivity,
          content
        });
      } catch (error) {
        console.error('Error parsing element:', line, error);
      }
    }

    return parsedElements;
  }

  private async findMatchingElement(
    elements: OmniParseElement[],
    userIntent: string,
    annotatedImageUrl: string
  ): Promise<MatchingElement | null> {
    if (!elements.length) return null;


    // Use Claude to determine which element to interact with
    const schema = z.object({
      elementId: z.string().describe("The ID of the element that best matches the user's intent"),
      confidence: z.number().min(0).max(1).describe("Confidence score between 0 and 1"),
      reasoning: z.string().describe("Very short description of why we are chosing this element"),
      action: z.enum([ElementAction.CLICK, ElementAction.INPUT, ElementAction.SCROLL, ElementAction.SWIPE])
        .describe("The action to perform on this element"),
      inputValue: z.string().optional().describe("Text to input if the action is INPUT")
    });

    const result = await generateObject({
      model: anthropic('claude-3-5-haiku-latest'),
      schema,
      messages: [
        new UserMessage([
          { type: 'text', text: `You are an AI assistant helping a user interact with a user interface.
          
          Here's a list of elements detected on the screen:
          ${JSON.stringify(elements, null, 2)}
          
          The user's intent is: "${userIntent}"
          
          I'm also providing the screenshot so you can see the visual context.
          
          Analyze the elements and the image to determine which element the user most likely wants to interact with.
          Each element has an ID that starts with "icon" followed by a number.
          Consider element content, type, interactivity, and visual appearance from the image.
          Return the element ID that best matches the user's intent, along with your confidence and reasoning.` },
          { type: 'image', image: annotatedImageUrl }
        ])
      ]
    });

    // Find the element with the ID matched by Claude
    const targetElement = elements.find(el => el.id == result.object.elementId);

    // Transform to MatchingElement format
    if (targetElement) {
      const matchingElement: MatchingElement = {
        id: targetElement.id,
        type: targetElement.type,
        normalized_bbox: targetElement.bbox, // Use bbox as normalized_bbox
        action: result.object.action || ElementAction.CLICK, // Default to CLICK if not specified
        reasoning: result.object.reasoning,
        confidence: result.object.confidence,
        inputValue: result.object.inputValue
      };
      return matchingElement;
    }

    return null;
  }
}
