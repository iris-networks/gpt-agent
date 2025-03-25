import type { PlatformStrategy } from "./platform-strategy-screen";

/**
 * Interface for an element in the element map response
 */
export interface ElementAction {
  coordinates: {
    center_x: number;
    center_y: number;
    width: number;
    height: number;
  }[];
  action: string;
  comment: string;
}

/**
 * Interface for image processors to implement
 */
export interface ImageProcessor {
  getMatchingElement(imagePath: string, dimensions: { width: number; height: number; scalingFactor: number }, input: ScreenToolInput): Promise<ElementAction>;
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