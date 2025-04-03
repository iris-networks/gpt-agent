import { generateText } from 'ai';
import { detectElements } from './detectElements';
import {z} from "zod";
import { getConfig } from './getConfig';
import { NextToolInput } from './schemas';
import { getModelProvider, ProviderType } from '../browser-agent/modelProviders';

export class OcularProcessor {
  async getMatchingElement(input: z.infer<typeof NextToolInput>, dataURI: string, dims: {
    width: number,
    height: number,
    scalingFactor: number
  }): Promise<string> {
    const response = await detectElements(dataURI, dims);
    
    // The response now directly contains the structured output as a string and the image URL
    const structuredOutput = response.output;
    // Convert image URL to data URI for browser extension compatibility
    const annotatedImage = await this.convertImageUrlToDataUri(response.image_url);

    const config = await getConfig();
    
    // Get the appropriate model provider
    const provider = getModelProvider({
      apiKey: config.apiKey,
      providerType: config.providerType || ProviderType.ANTHROPIC,
      // Use provided model name or fallback to Claude 3.5 Sonnet for vision tasks
      modelName: config.modelName
    });

    // Prepare messages for the model
    const messages = [
        {
          "role": "user",
          "content": [
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
        }, 
        {
          "role": "assistant",
          "content": [
            {
              "type": "text",
              "text": `Certainly! Please provide the layout and the screenshot for analysis.`
            }
          ]
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `Here is the layout, and the screenshot. 

            <ui_elements_layout>
                ${structuredOutput}
            </ui_elements_layout>`
            },
            {
              "type": "image",
              "image": annotatedImage,
              "mimeType": "image/png"
            }
          ]
        }, {
          "role": "assistant",
          "content": [
            {
              "type": "text",
              "text": "Perfect! Now please provide the user's goal and previous actions, so I can determine the next optimal action."
            }
          ]
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `Here is the goal and previous actions
            <goal>
              ${input.userIntent}
            </goal>
            <previous_actions>
              ${input.previousActions?.toString()}
            </previous_actions>
            
            Now figure out if the last action was successful or not. Incase last action was not successful provide the best action for that.
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
          ]
        }
      ]
    
    // Generate text using the configured provider
    const { text } = await provider.generateText(messages);
    return text;
  }

  /**
   * Converts an image URL to a data URI
   * @param url The image URL to convert
   * @returns A Promise that resolves to the data URI
   */
  private async convertImageUrlToDataUri(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image URL to data URI:', error);
      return url; // Return original URL as fallback
    }
  }
}