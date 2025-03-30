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
    // Get config values from environment variables
    const config = getScreenConfig();
    
    // If all dimensions are provided in environment variables, use those
    if (config.width && config.height && config.scalingFactor) {
      return {
        width: config.width,
        height: config.height,
        scalingFactor: config.scalingFactor
      };
    }
    
    try {
      // Get resolution if width or height not provided
      let width = config.width;
      let height = config.height;
      
      if (!width || !height) {
        const { stdout: resolutionOutput } = await exec(
          `system_profiler SPDisplaysDataType | grep Resolution | awk '{print $2, $4}'`
        );
        
        const dimensions = resolutionOutput.trim().split(' ');
        
        if (dimensions.length >= 2 && dimensions[0] && dimensions[1]) {
          width = width || parseInt(dimensions[0], 10);
          height = height || parseInt(dimensions[1], 10);
        } else {
          throw new Error('Failed to determine screen dimensions on macOS');
        }
      }
      
      // Check for Retina display if scaling factor not provided
      let scalingFactor = config.scalingFactor;
      
      if (!scalingFactor) {
        const { stdout: retinaOutput } = await exec(
          `system_profiler SPDisplaysDataType | grep "Retina" || true`
        );
        
        scalingFactor = retinaOutput.includes("Retina") ? 2 : 1;
      }
      
      return { width, height, scalingFactor };
    } catch (error) {
      throw new Error(`Failed to get screen dimensions: ${error}`);
    }
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