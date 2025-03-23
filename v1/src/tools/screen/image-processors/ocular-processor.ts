import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import type { ImageProcessor, ProcessImageResponse, ElementMapItem } from '../../../interfaces/screen-interfaces';

export class OcularProcessor implements ImageProcessor {
  private apiUrl: string;

  constructor(apiUrl: string = 'https://oculus-server.fly.dev') {
    this.apiUrl = apiUrl;
  }

  async processImage(
    imagePath: string, 
    dimensions: { width: number; height: number; scalingFactor: number }
  ): Promise<ProcessImageResponse> {
    try {
      const formData = new FormData();
      formData.append('image', fs.createReadStream(imagePath));
      formData.append('width', dimensions.width.toString());
      formData.append('height', dimensions.height.toString());

      const response = await axios.post<ProcessImageResponse>(`${this.apiUrl}/process`, formData, {
        headers: {
          'accept': 'application/json',
          'Content-Type': 'multipart/form-data',
          ...formData.getHeaders()
        },
      });

      // Adjust coordinates based on scaling factor
      response.data.element_map.forEach(element => {
        element.coordinates.center_x = Math.round(element.coordinates.center_x / dimensions.scalingFactor);
        element.coordinates.center_y = Math.round(element.coordinates.center_y / dimensions.scalingFactor);
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to process image with Ocular: ${error}`);
    }
  }

  async getAnnotatedImage(imageId: string): Promise<Buffer> {
    try {
      const imageResponse = await axios.get(
        `${this.apiUrl}/image/${imageId}`,
        {
          responseType: 'arraybuffer',
        }
      );
      return Buffer.from(imageResponse.data);
    } catch (error) {
      throw new Error(`Failed to get annotated image: ${error}`);
    }
  }

  async findMatchingElement(
    imageBuffer: Buffer,
    elementMap: Partial<ElementMapItem>[],
    input: { userInput?: string; summary?: string; helpText?: string }
  ): Promise<Partial<ElementMapItem>> {
    try {
      const prompt = `Context:
- User Input: ${input.userInput || 'No initial input provided'}
- Past Actions: ${input.summary || 'No previous actions'}
${input.helpText ? `- Additional Help: ${input.helpText}` : ''}

Image Analysis:
- Detected Interactive Elements:
${JSON.stringify(elementMap, null, 2)}

Validation:
First, verify if this screenshot is relevant to the current goal and context:
1. Does the screenshot contain elements related to the goal?
2. Are the detected elements consistent with expected UI state based on past actions?
3. Is the current screen state logical given the interaction flow?

If the screenshot is NOT relevant, respond with exactly:
{"error": "Screenshot does not match current context"}

Otherwise, analyze the elements and context carefully:
1. Which element best aligns with achieving the current goal?
2. Are there elements matching keywords from user input or goal?
3. How do past actions influence which element to interact with next?
4. Consider partial text matches due to OCR limitations
${input.helpText ? '5. Pay special attention to the additional help text provided for finding the element' : ''}

Provide your analysis in this exact JSON format with no additional text:
{
  "id": "id of the element",
  "text": "text of the element to interact with next",
  "code": "element code for interaction",
  "confidence": "high|medium|low",
  "reasoning": "brief explanation of why this element was chosen"
}`;

      // Use AI SDK for Claude integration
      const { text } = await generateText({
        model: anthropic('claude-3-haiku-20240307'),
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                image: imageBuffer,
                mimeType: 'image/png',
              },
              {
                type: 'text',
                text: prompt,
              },
            ],
          }
        ]
      });

      // Parse the response to extract element info
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const analysisResponse = JSON.parse(jsonMatch[0]);

        // Find the matching element from elementMap
        let matchingElement = elementMap.find(element => element.id === +analysisResponse.id);

        if (!matchingElement) {
          throw new Error('No matching element found in the element map');
        }

        return matchingElement;
      } else {
        throw new Error("Could not extract element information from LLM response");
      }
    } catch (error) {
      throw new Error(`Failed to analyze image with LLM: ${error}`);
    }
  }
}