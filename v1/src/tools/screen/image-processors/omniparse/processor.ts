import type { ElementAction, ImageProcessor, ScreenToolInput } from '../../../../interfaces/screen-interfaces';
import { getLLMPrediction } from '../llm-utils';
import { detectElements } from './api';

export class OmniParserProcessor implements ImageProcessor {
  async getMatchingElement(imagePath: string, dimensions: { width: number; height: number; scalingFactor: number }, input: ScreenToolInput): Promise<ElementAction> {
    // Detect UI elements using OmniParser API
    const elements = await detectElements(imagePath);
    
    // Get LLM prediction for the most appropriate element to interact with
    const elementAction = await getLLMPrediction(elements, input.userIntent || '');
    
    // Scale coordinates based on dimensions and scaling factor
    elementAction.coordinates = elementAction.coordinates.map(coord => ({
      center_x: Math.round(coord.center_x * dimensions.width / dimensions.scalingFactor),
      center_y: Math.round(coord.center_y * dimensions.height / dimensions.scalingFactor),
      width: Math.round(coord.width * dimensions.width / dimensions.scalingFactor),
      height: Math.round(coord.height * dimensions.height / dimensions.scalingFactor)
    }));
    
    return elementAction;
  }
}