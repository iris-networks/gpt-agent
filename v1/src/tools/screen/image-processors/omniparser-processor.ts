import type { ElementMapItem, ImageProcessor, ProcessImageResponse } from "../../../interfaces/screen-interfaces";
import Replicate from "replicate";

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
  id?: string;
  output?: {
    img?: string;
    elements?: string;
  };
  [key: string]: any;
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
      const input: OmniParserInputOptions = {
        image: imagePath,
        imgsz: Math.min(dimensions.width, dimensions.height),
        box_threshold: 0.05,
        iou_threshold: 0.1
      };

      const output = await this.replicate.run(
        this.model,
        { input }
      ) as OmniParserOutput;

      if (!output || typeof output !== "object") {
        throw new Error("Invalid response from OmniParser API");
      }

      const elements = this.parseElements(output);
      
      return {
        element_map: elements,
        output_image_url: output?.output?.img || "",
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Error processing image with OmniParser:", error);
      throw new Error(`Failed to process image with OmniParser: ${errorMessage}`);
    }
  }

  private parseElements(output: OmniParserOutput): ElementMapItem[] {
    const elements: ElementMapItem[] = [];
    const elementsString: string = output?.output?.elements || "";
    
    // Parse the elements string into structured data
    const elementLines: string[] = elementsString.split("\n");
    for (const line of elementLines) {
      try {
        // Extract data from each line like "icon 0: {'type': 'text', 'bbox': [0.029, 0.008, 0.058, 0.022]..."
        const match = line.match(/icon \d+: (.+)/);
        if (match) {
          const elementData = eval(`(${match[1]})`) as OmniParserElementData;
          
          // Transform bbox from normalized [x1, y1, x2, y2] to required format
          const [x1, y1, x2, y2] = elementData.bbox;
          
          elements.push({
            id: elements.length,
            type: elementData.type,
            text: elementData.content || null,
            icon_type: null,
            code: null,
            coordinates: {
              center_x: Math.round((x1 + x2) * 500),
              center_y: Math.round((y1 + y2) * 500),
              width: Math.round((x2 - x1) * 1000),
              height: Math.round((y2 - y1) * 1000)
            },
            original_coordinates: {
              center_x: Math.round((x1 + x2) * 500),
              center_y: Math.round((y1 + y2) * 500),
              width: Math.round((x2 - x1) * 1000),
              height: Math.round((y2 - y1) * 1000)
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
    try {
      const prediction = await this.replicate.predictions.get(imageId) as OmniParserPrediction;
      const annotatedImageUrl = prediction?.output?.img;
      
      if (!annotatedImageUrl) {
        throw new Error("Annotated image URL not found");
      }
      
      // Fetch the image from the URL and convert to Buffer
      const response = await fetch(annotatedImageUrl);
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Error getting annotated image:", error);
      throw new Error(`Failed to get annotated image: ${errorMessage}`);
    }
  }

  async findMatchingElement(
    imageBase64: string,
    elementMap: Partial<ElementMapItem>[],
    input: { userInput?: string; summary?: string; helpText?: string }
  ): Promise<Partial<ElementMapItem>> {
    // Simple implementation that searches for matching text in the elements
    if (!input.userInput) {
      throw new Error("User input is required to find matching element");
    }
    
    const searchText: string = input.userInput.toLowerCase();
    
    for (const element of elementMap) {
      if (element.text?.toLowerCase().includes(searchText)) {
        return element;
      }
    }
    
    throw new Error(`No matching element found for "${input.userInput}"`);
  }
}