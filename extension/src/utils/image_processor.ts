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
      modelName: config.modelName
    });

    // Get current URL if possible (for context awareness)
    let currentUrl = "";
    try {
      // This works in a Chrome extension context
      const tabs = await chrome.tabs.query({active: true, currentWindow: true});
      currentUrl = tabs[0]?.url || "";
    } catch (error) {
      console.log("Unable to get current URL. Extension context may be limited.");
    }

    // Prepare messages for the model with improved prompting
    const messages = [
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `You are an intelligent browser automation. Your task is to analyze the screenshot, evaluate the current situation, and determine the best next action based on the user's goal.

              First, evaluate the current state:
              - Assess if the previous action was successful or if there was an error
              - Determine if we're on the expected page/state (Current URL: ${currentUrl || "unknown"})
              - Check if the goal has already been achieved
              
              Then, identify the best element to interact with by considering:
              1. Most relevant elements to achieve the goal
              2. Text elements that directly match the user's intent
              3. Form fields, buttons or links that logically advance the workflow
              4. Interactive elements even if they're only partially visible
              
              Think like a human would (but these thoughts are internal to you and you should not output these):
              - "I see the search box is now visible, I should click there and type..."
              - "The previous action didn't work because the button is disabled, let me try..."
              - "We're now on the checkout page, so the next step is to..."
              - "I can see we've successfully logged in because the profile icon is visible..."
              - "I should scroll down to find more options since I don't see what we need yet"
              
              Screen dimensions: ${dims.width/dims.scalingFactor}x${dims.height/dims.scalingFactor}
              
              If facing obstacles:
              - Suggest alternative approaches when the primary path fails
              - Consider scrolling to find more content

              - Detect error messages and respond accordingly
              
              If the goal is achieved:
              - Clearly indicate success with "GOAL_ACHIEVED: [brief explanation]"
              - Don't suggest further actions if unnecessary`
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
              "text": `Here is the goal and previous actions:
            <goal>
              ${input.userIntent}
            </goal>
            <previous_actions>
              ${input.previousActions}
            </previous_actions>
            
            Think through this situation carefully:
            1. Has the goal been achieved? If yes, state this clearly.
            2. Was the last action successful? If not, why not and what should we do differently?
            3. Are we on the expected page/state? If not, how should we navigate to the correct place?
            4. What is the most logical next action based on the current state and goal?
            
            ## Response Format
            If you can determine the best next action with high confidence:
              <command> [x,y] [optional text]
            
            Only if you encounter an issue, need to reroute, or need to explain a key decision:
              [Brief explanation of the issue or rationale]
              <command> [x,y] [optional text]
            
            Examples of intermediate commands:
            - click [152,34]
            - type [300,520] 'password123'
            - press Enter
            - scroll down
              
            If no more action is required:
              - GOAL_ACHIEVED [optional text]
            `
            }
          ]
        }
      ];
    
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