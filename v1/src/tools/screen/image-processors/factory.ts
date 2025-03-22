
import { OcularProcessor } from './ocular-processor';
import { OmniParserProcessor } from './omniparser-processor';
import { getImageProcessorConfig } from './config';
import { ImageProcessorType, type ImageProcessor } from '../../../interfaces/screen-interfaces';

export class ImageProcessorFactory {
  static createProcessor(type?: ImageProcessorType, apiUrl?: string): ImageProcessor {
    const config = getImageProcessorConfig();
    const processorType = type || config.type;
    const processorApiUrl = apiUrl || config.apiUrl;
    
    switch (processorType) {
      case ImageProcessorType.OCULAR:
        return new OcularProcessor(processorApiUrl);
      case ImageProcessorType.OMNIPARSER:
        return new OmniParserProcessor();
      default:
        throw new Error(`Unsupported image processor type: ${processorType}`);
    }
  }
}