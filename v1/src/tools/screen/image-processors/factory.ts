
import { OcularProcessor } from './ocular';
import { OmniParserProcessor } from './omniparse';
import { getImageProcessorConfig } from './config';
import { ImageProcessorType, type ImageProcessor } from '../../../interfaces/screen-interfaces';

export class ImageProcessorFactory {
  static createProcessor(type?: ImageProcessorType, apiUrl?: string): ImageProcessor {
    const config = getImageProcessorConfig();
    const processorType = type || config.type;
    
    switch (processorType) {
      case ImageProcessorType.OCULAR:
        return new OcularProcessor();
      case ImageProcessorType.OMNIPARSER:
        return new OmniParserProcessor();
      default:
        throw new Error(`Unsupported image processor type: ${processorType}`);
    }
  }
}