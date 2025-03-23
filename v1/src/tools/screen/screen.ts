import { z } from "zod";
import { StringToolOutput, Tool, type ToolEmitter, type ToolInput } from "beeai-framework";
import { Emitter } from "beeai-framework/emitter/emitter";
import fs from "fs";
import path from "path";
import { PlatformStrategyFactory } from "./platform-strategy-factory";
import type { PlatformStrategy } from "../../interfaces/platform-strategy-screen";

import { ImageProcessorFactory } from "./image-processors";
import { getImageProcessorConfig } from "./image-processors/config";
import type { ImageProcessor, ScreenToolInput } from "../../interfaces/screen-interfaces";

export class ScreenTool extends Tool<StringToolOutput> {
  inputSchema() {
    return z.object({
      userInput: z.string().describe("The initial user interaction request or command"),
      summary: z.string().describe("summary of past actions").optional(),
      helpText: z.string().describe("Additional help text to find the element").optional(),
    });
  }

  name = "ScreenTool";
  description = `This tool can find ui elements and their coordinates on the screen for the next action based on user input and past actions.`

  public readonly emitter: ToolEmitter<ToolInput<this>, StringToolOutput> = Emitter.root.child({
    namespace: ["tool", "screen"],
    creator: this,
  });

  private strategy: PlatformStrategy;
  private timeoutMs: number;
  private imageProcessor: ImageProcessor;

  constructor({
    strategyOverride,
    timeoutMs,
    imageProcessor,
    imageProcessorType,
    apiUrl,
  }: ScreenToolInput = {}) {
    super();
    
    const config = getImageProcessorConfig();
    this.strategy = strategyOverride || PlatformStrategyFactory.createStrategy();
    this.timeoutMs = timeoutMs || config.timeoutMs || 10000;
    
    // Use provided processor or create one based on type or config
    this.imageProcessor = imageProcessor || 
      ImageProcessorFactory.createProcessor(imageProcessorType, apiUrl);
  }

  protected async _run(input: ToolInput<this>): Promise<StringToolOutput> {
    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timed out after ${this.timeoutMs}ms`)), this.timeoutMs);
    });

    try {
      // Take screenshot
      const screenshotPath = path.join(process.cwd(), 'screenshots', `screenshot-${Date.now()}.png`);

      // Ensure directory exists
      const dir = path.dirname(screenshotPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const screenshotPromise = this.strategy.takeScreenshot(screenshotPath);
      await Promise.race([screenshotPromise, timeoutPromise]);

      // Get screen dimensions dynamically from the strategy
      const dimensions = await this.strategy.getScreenDimensions();

      // Process the image with the selected processor
      const processedData = await this.imageProcessor.processImage(screenshotPath, dimensions);

      // Get the annotated image
      const imageId = processedData.output_image_url.split('/').pop();
      if(!imageId) throw new Error('Image ID not found')
      const imageBuffer = await this.imageProcessor.getAnnotatedImage(imageId);

      // Modify the element map (remove original_coordinates, confidence, and color)
      const modifiedElementMap = processedData.element_map.map(element => {
        const { original_coordinates, confidence, color, type, ...rest } = element;
        return rest;
      });

      // Use LLM to analyze the image and find the element
      const matchingElement = await this.imageProcessor.findMatchingElement(
        imageBuffer, 
        modifiedElementMap, 
        input
      );

      return new StringToolOutput(JSON.stringify(matchingElement));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Screen tool failed: ${errorMessage}`);
    }
  }
}