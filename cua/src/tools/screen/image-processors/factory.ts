
import { OcularProcessor } from './ocular';
import { OmniParserProcessor } from './omniparse';
import { ImageProcessorType, type ImageProcessor } from '../../../interfaces/screen-interfaces';
import { PlatformStrategyFactory } from '../platform-strategy-factory';

export class ImageProcessorFactory {
  static async createProcessor(): Promise<ImageProcessor> {
    const processorType = process.env.IMAGE_PROCESSOR_TYPE;

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