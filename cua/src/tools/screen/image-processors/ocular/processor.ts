import { detectElements } from './api';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import type { ImageProcessor } from '../../../../interfaces/screen-interfaces';
import { PlatformStrategyFactory } from '../../platform-strategy-factory';
import { AssistantMessage, UserMessage } from 'beeai-framework/backend/message';
import type { NextToolInput } from '../../../next-action/nextActionTool';
import { z } from 'zod';
export class OcularProcessor implements ImageProcessor {
  async getMatchingElement(input: z.infer<typeof NextToolInput>, buffer: Buffer): Promise<string> {
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

    const {text} = await generateText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      messages: [
        new UserMessage(
          [
            {
              "type": "text",
              "text": `Your task is to analyze the screenshot and identify the best UI element to interact with based on the user's goal. Follow this element prioritization hierarchy:

              1. Element Selection Priority:
                 a) Clear text elements visible on screen (highest priority)
                 b) Fuzzy/partial text matches when exact matches aren't available
                 c) Icon elements with their two-letter code annotations (e.g., A3)
                 d) Use spatial references when multiple similar elements exist
              
              2. For multiple matching elements, disambiguate using:
                 a) Relevance to the user's stated goal
                 b) The element's coordinates/position on screen
                 c) The element's code identifier (e.g., A3)
                 d) Logical workflow sequence based on previous actions
              
              Screen dimensions: ${dims.width/dims.scalingFactor}x${dims.height/dims.scalingFactor}
              
              3. Fallback actions if no appropriate elements found:
                 a) Suggest scrolling to find more content
                 b) Recommend tab navigation for form sequences
                 c) Clearly state "Unable to locate [element]. Suggest checking..." when appropriate
              
              Generate only the next command to be executed. Be concise but include all necessary details.`
            }
          ]
        ),
        new AssistantMessage(
          {
            "type": "text",
            "text": "Certainly! Please provide the layout and the screenshot for analysis."
          }
        ),
        new UserMessage([
          {
            "type": "text",
            "text": `Here is the layout, and the screenshot. 

            <ui_elements_layout>
                ${structuredOutput}
            </ui_elements_layout>`
          },
          {
            "type": "image",
            "image": dataUri,
            "mimeType": "image/png"
          }
        ]),

        new AssistantMessage(
          {
            "type": "text",
            "text": "Perfect! Now please provide the user's goal and previous actions, so I can determine the next optimal action."
          }
        ),

        new UserMessage([
          {
            "type": "text",
            "text": `Here is the goal and previous actions
            <goal>
              ${input.userIntent}
            </goal>
            <previous_actions>
              ${input.previousActions?.toString()}
            </previous_actions>
            
            Now share the next action. For click/type commands always include the coordinates of the target element.
            
            ## Response Format
            <command> [x,y] [optional text] # Brief rationale

            Examples:
            - click [152,34] # Firefox address bar
            - type [300,520] 'password123' # Login password field
            - press Enter # After text input
            - scroll down # To find more results
            `
          }
        ]),
      ],
    });

    return text;
  }
}