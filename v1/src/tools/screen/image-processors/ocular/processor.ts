import { detectElements } from './api';
import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { UserMessage } from 'beeai-framework/backend/message';
import { z } from 'zod';
import { ElementAction } from './types';
import type { ImageProcessor, MatchingElement } from '../../../../interfaces/screen-interfaces';

// Configure base URL for annotated images
const OCULAR_IMAGE_BASE_URL = process.env.OCULAR_IMAGE_BASE_URL || 'https://oculus-server.fly.dev/images';

export class OcularProcessor implements ImageProcessor {
  async getMatchingElement(input: { userIntent?: string; summary?: string; helpText?: string; }, buffer: Buffer): Promise<MatchingElement | null> {
    const response = await detectElements(buffer);
    const annotated_image_path = response.annotated_image_path;
    const elements = response.elements;

    // Extract the filename from the path and construct the full URL
    const imageFilename = annotated_image_path.split('/').pop();
    const fullImageUrl = `${OCULAR_IMAGE_BASE_URL}/${imageFilename}`;

    // Create an array of elements with proper grouping of text elements
    const modifiedElements = elements.map(element => {
      if (element.text) {
        // For text elements, keep all words together but include their IDs and bounding boxes
        return {
          type: 'text',
          textContent: element.text,
          words: element.words!.map(word => ({
            id: word.id,
            boundingBox: word.normalized_bbox,
          }))
        };
      } else {
        // For non-text elements
        return {
          type: 'non-text',
          id: element.id,
          code: element.code
        };
      }
    });


    // Call the LLM to identify the element to interact with, now including the image
    const llmResponse = await generateObject({
      model: anthropic('claude-3-haiku-20240307'),
      schema: z.object({
        elementId: z.string(),
        action: z.enum([ElementAction.CLICK, ElementAction.INPUT, ElementAction.SCROLL, ElementAction.SWIPE]),
        reason: z.string(),
        inputValue: z.string().optional()
      }),
      messages: [
        new UserMessage([
          {
            type: 'text', text: `
      I have a screenshot of a mobile app or website. Based on the following user intent and the elements detected in the image, identify which element should be interacted with next.
      
      User Intent: ${input.userIntent || ''}
      Summary: ${input.summary || ''}
      Help Text: ${input.helpText || ''}
      
      Here are the elements detected in the image:
      ${JSON.stringify(modifiedElements, null, 2)}
      
      Please analyze the elements and determine which one should be interacted with to fulfill the user's intent.
      Return a JSON object with the following structure:
      {
        "elementId": "the ID of the element to interact with",
        "action": "the action to perform (click, input, etc.)",
        "reason": "explanation of why this element was chosen",
        "inputValue": "if the action is input, provide the text to input (optional)"
      }
    ` },
          { type: 'image', image: fullImageUrl }
        ])
      ]
    });

    // Find the identified element in our elements array
    let targetElement = null;

    // For text elements, we need to check the words array
    for (const element of elements) {
      if (element.text && element.words) {
        for (const word of element.words) {
          if (word.id == llmResponse.object.elementId) {
            targetElement = {
              id: word.id,
              type: element.type,
              normalized_bbox: word.normalized_bbox,
              action: llmResponse.object.action,
              reasoning: llmResponse.object.reason,
              inputValue: llmResponse.object.inputValue
            };
            break;
          }
        }
      } else if (element.id == llmResponse.object.elementId) {
        targetElement = {
          id: element.id,
          type: element.type,
          normalized_bbox: element.normalized_bbox,
          action: llmResponse.object.action,
          reasoning: llmResponse.object.reason,
          inputValue: llmResponse.object.inputValue
        };
        break;
      }
    }
    return targetElement;
  }
}