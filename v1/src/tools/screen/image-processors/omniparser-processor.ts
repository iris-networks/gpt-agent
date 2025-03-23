import type { ElementMapItem, ImageProcessor, ProcessImageResponse } from "../../../interfaces/screen-interfaces";
import Replicate, { type FileOutput } from "replicate";
import fs from "fs";
import path from "path";
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

interface OmniParserInputOptions {
  image: string;
  imgsz: number;
  box_threshold: number;
  iou_threshold: number;
}

interface OmniParserElementData {
  type: string;
  bbox: [number, number, number, number];
  interactivity: boolean;
  content?: string;
}

interface OmniParserOutput {
  img?: FileOutput;
  elements?: string;
}

interface OmniParserPrediction {
  output?: {
    img?: string;
  };
  [key: string]: any;
}

export class OmniParserProcessor implements ImageProcessor {
  private replicate: Replicate;
  private model: `${string}/${string}` = "microsoft/omniparser-v2:49cf3d41b8d3aca1360514e83be4c97131ce8f0d99abfc365526d8384caa88df";
  private dimensions: { width: number; height: number; scalingFactor: number } | null = null;

  private annotatedImageUrl = "";
  constructor() {
    this.replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });
  }

  async processImage(
    imagePath: string, 
    dimensions: { width: number; height: number; scalingFactor: number }
  ): Promise<ProcessImageResponse> {
    try {
      // Store dimensions for use in parseElements
      this.dimensions = dimensions;
      
      // Convert local file path to data URI if it's not already a URL
      let imageUri = imagePath;
      if (!imagePath.startsWith('http')) {
        const fileBuffer = fs.readFileSync(imagePath);
        const fileExt = path.extname(imagePath).substring(1);
        const base64Data = fileBuffer.toString('base64');
        imageUri = `data:image/${fileExt};base64,${base64Data}`;
      }
      
      const prediction = await this.replicate.deployments.predictions.create(
        "codebanesr",
        "omniparser",
        {
          input: {
            image: imageUri
          }
        }
      );

      const result = await this.replicate.wait(prediction);

      const elements = this.parseElements(result.output);
      

      this.annotatedImageUrl = result.output.img || "";
      return {
        element_map: elements,
        output_image_url: result.output.img || "",
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Error processing image with OmniParser:", error);
      throw new Error(`Failed to process image with OmniParser: ${errorMessage}`);
    }
  }

  private parseElements(output: OmniParserOutput): ElementMapItem[] {
    const elements: ElementMapItem[] = [];
    const elementsString: string = output?.elements || "";
    
    // Parse the elements string into structured data
    const elementLines: string[] = elementsString.split("\n");
    for (const line of elementLines) {
      try {
        // Extract data from each line like "icon 0: {'type': 'text', 'bbox': [0.029, 0.008, 0.058, 0.022]..."
        const match = line.match(/icon (\d+): (.+)/);
        if (match && match[1] && match[2]) {
          const iconId = parseInt(match[1], 10);
          // Replace Python-style booleans with JavaScript booleans before parsing
          const pythonData = match[2].replace(/True/g, 'true').replace(/False/g, 'false');
          const elementData = eval(`(${pythonData})`) as OmniParserElementData;
          
          // Only include elements with interactivity set to true
          if (!elementData.interactivity) {
            continue;
          }
          
          // Transform bbox from normalized [x1, y1, x2, y2] to required format
          const [x1, y1, x2, y2] = elementData.bbox;
          
          // Use actual dimensions for scaling if available, otherwise fall back to default values
          const width = this.dimensions?.width || 1000;
          const height = this.dimensions?.height || 1000;
          const scalingFactor = this.dimensions?.scalingFactor || 1;
          
          // Calculate denormalized coordinates
          const centerX = Math.round(((x1 + x2) / 2) * width / scalingFactor);
          const centerY = Math.round(((y1 + y2) / 2) * height / scalingFactor);
          const elementWidth = Math.round((x2 - x1) * width / scalingFactor);
          const elementHeight = Math.round((y2 - y1) * height / scalingFactor);
          
          elements.push({
            id: iconId, // Use the extracted icon ID instead of sequential numbering
            type: elementData.type,
            text: elementData.content || null,
            icon_type: null,
            code: null,
            coordinates: {
              center_x: centerX,
              center_y: centerY,
              width: elementWidth,
              height: elementHeight
            },
            original_coordinates: {
              center_x: centerX,
              center_y: centerY,
              width: elementWidth,
              height: elementHeight
            },
            confidence: 1.0,
            color: [0, 0, 0]
          });
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error parsing element: ${line}`, errorMessage);
      }
    }
    
    return elements;
  }

  async getAnnotatedImage(imageId: string): Promise<Buffer> {
    if (!this.annotatedImageUrl) {
      throw new Error("No annotated image URL available");
    }
    
    try {
      const response = await fetch(this.annotatedImageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Error fetching annotated image:", errorMessage);
      throw new Error(`Failed to get annotated image: ${errorMessage}`);
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

If the screenshot is NOT relevant, respond with exactly:
{"error": "Screenshot does not match current context"}

Otherwise, analyze the elements and context carefully:
1. Which element best aligns with achieving the current goal, there could be multiple images, you need to choose wisely
2. Consider partial text matches due to OCR limitations
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
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Error finding matching element with LLM:", errorMessage);
      throw new Error(`Failed to analyze image with LLM: ${errorMessage}`);
    }
  }
}


// new OmniParserProcessor().processImage("/Users/shanurrahman/Documents/spc/qwen/zenobia/screenshots/screenshot-1742686012895.png", {
//   width: 3456,
//   height: 2234,
//   scalingFactor: 1
// }).then(console.log).catch(console.error);