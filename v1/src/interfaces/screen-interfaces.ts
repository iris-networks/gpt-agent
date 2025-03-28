import type { ElementAction } from "../tools/screen/image-processors/ocular/types";
import type { PlatformStrategy } from "./platform-strategy-screen";

/**
 * Interface for the matching element returned by image processors
 */
export interface MatchingElement {
  /**
   * Unique identifier for the element
   */
  id: string;
  
  /**
   * The type of element (text, button, etc.)
   */
  type: string;
  
  /**
   * Normalized bounding box coordinates [x1, y1, x2, y2] in range [0,1]
   */
  normalized_bbox: number[];
  
  /**
   * Action to perform on the element
   */
  action: ElementAction;
  
  /**
   * Optional reason explaining why this element was chosen
   */
  reasoning?: string;
  
  /**
   * Optional confidence score (0-1) indicating confidence in the match
   */
  confidence?: number;
  
  /**
   * Optional input value if the action is ElementAction.INPUT
   */
  inputValue?: string;

  text?: string;
}

/**
 * Interface for image processors to implement
 */
export interface ImageProcessor {
  getMatchingElement(input: { userIntent?: string; summary?: string; helpText?: string }, buffer: Buffer): Promise<string>;
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