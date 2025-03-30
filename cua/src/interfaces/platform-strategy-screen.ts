import type { BaseToolOptions } from "beeai-framework";
import { LLMTool } from "beeai-framework/tools/llm";

export interface PlatformStrategy {
  takeScreenshot(outputPath: string): Promise<string>;
  getScreenDimensions(): Promise<{ width: number; height: number; scalingFactor: number }>;
}

export interface ScreenToolInput extends BaseToolOptions {
  strategyOverride?: PlatformStrategy;
  timeoutMs?: number;
  apiUrl?: string;
  llmTool?: LLMTool;
}