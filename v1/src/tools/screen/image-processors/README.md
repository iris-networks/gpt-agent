# Image Processors for Screen Tool

This directory contains the image processing modules for the ScreenTool.

## Available Processors

### 1. Ocular Processor
Uses the Ocular server for basic image processing without GPU requirements.

### 2. OmniParser Processor
A more advanced processor with enhanced capabilities.

## Configuration

You can configure which processor to use through:

1. Environment variables:
   ```
   IMAGE_PROCESSOR_TYPE=ocular|omniparser
   IMAGE_PROCESSOR_API_URL=https://your-api-url.com
   IMAGE_PROCESSOR_TIMEOUT_MS=10000
   ```

2. Direct instantiation in code:
   ```typescript
   import { ScreenTool } from './tools/screen/screen';
   import { ImageProcessorType } from './interfaces/screen-interfaces';

   const screenTool = new ScreenTool({
     imageProcessorType: ImageProcessorType.OMNIPARSER,
     apiUrl: 'https://your-custom-api.com'
   });
   ```

3. Custom processor implementation:
   ```typescript
   import { ScreenTool } from './tools/screen/screen';
   import { MyCustomProcessor } from './my-custom-processor';

   const customProcessor = new MyCustomProcessor();
   const screenTool = new ScreenTool({
     imageProcessor: customProcessor
   });
   ```

## Implementing a New Processor

Create a new class that implements the `ImageProcessor` interface:

```typescript
import { 
  ElementMapItem, 
  ImageProcessor, 
  ProcessImageResponse 
} from '../../../interfaces/screen-interfaces';

export class MyCustomProcessor implements ImageProcessor {
  async processImage(
    imagePath: string, 
    dimensions: { width: number; height: number; scalingFactor: number }
  ): Promise<ProcessImageResponse> {
    // Your implementation here
  }

  async getAnnotatedImage(imageId: string): Promise<Buffer> {
    // Your implementation here
  }

  async findMatchingElement(
    imageBase64: string,
    elementMap: Partial<ElementMapItem>[],
    input: { userInput?: string; summary?: string; helpText?: string }
  ): Promise<Partial<ElementMapItem>> {
    // Your implementation here
  }
}
```