import { promisify } from "util";
import { exec as execCallback } from "child_process";
import type { PlatformStrategy } from "../../../interfaces/platform-strategy-screen";
import { getScreenConfig } from "../config";

const exec = promisify(execCallback);

/**
 * macOS implementation using screencapture
 */
export class MacOSStrategy implements PlatformStrategy {
  async getScreenDimensions(): Promise<{ width: number; height: number; scalingFactor: number }> {
    // Get config values from environment variables with defaults
    const config = getScreenConfig();
    
    // Simply return the values from config
    return {
      width: config.width,
      height: config.height,
      scalingFactor: config.scalingFactor
    };
  }
  
  async takeScreenshot(outputPath: string): Promise<string> {
    try {
      // Use the built-in screencapture command on macOS
      const { stdout } = await exec(`screencapture -C -x "${outputPath}"`);
      return stdout;
    } catch (error) {
      throw new Error(`Failed to take screenshot: ${error}`);
    }
  }
}