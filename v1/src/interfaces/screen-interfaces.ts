import type { FileOutput, Prediction } from "replicate";
import type { PlatformStrategy } from "./platform-strategy-screen";

/**
 * Interface for an element in the element map response
 */
export interface ElementMapItem {
  id: number;
  type: string;
  text: string | null;
  icon_type: string | null;
  code: string | null;
  coordinates: {
    center_x: number;
    center_y: number;
    width: number;
    height: number;
  };
  original_coordinates: {
    center_x: number;
    center_y: number;
    width: number;
    height: number;
  };
  confidence: number;
  color: number[];
}

/**
 * Interface for the image processing API response
 */
export interface ProcessImageResponse {
  element_map: ElementMapItem[];
  output_image_url: FileOutput;
}

/**
 * Interface for image processors to implement
 */
export interface ImageProcessor {
  processImage(imagePath: string, dimensions: { width: number; height: number; scalingFactor: number }): Promise<Prediction>;
  getAnnotatedImage(imageId: string): Promise<Buffer>;
  findMatchingElement(
    imageBuffer: Buffer,
    elementMap: Partial<ElementMapItem>[],
    input: { userInput?: string; summary?: string; helpText?: string }
  ): Promise<Partial<ElementMapItem>>;
}

/**
 * Enum for available image processor types
 */
export enum ImageProcessorType {
  OCULAR = 'ocular',
  OMNIPARSER = 'omniparser'
}

/**
 * Input options for the ScreenTool
 */
export interface ScreenToolInput {
  strategyOverride?: PlatformStrategy;
  timeoutMs?: number;
  imageProcessor?: ImageProcessor;
  imageProcessorType?: ImageProcessorType;
  apiUrl?: string;
  llmTool?: any;
  [key: string]: any;
}