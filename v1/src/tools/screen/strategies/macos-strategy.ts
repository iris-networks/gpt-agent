import { promisify } from "util";
import { exec as execCallback } from "child_process";
import type { PlatformStrategy } from "../../../interfaces/platform-strategy-screen";

const exec = promisify(execCallback);

/**
 * macOS implementation using screencapture
 */
export class MacOSStrategy implements PlatformStrategy {
  async getScreenDimensions(): Promise<{ width: number; height: number; scalingFactor: number }> {
    try {
      // Get resolution
      const { stdout: resolutionOutput } = await exec(
        `system_profiler SPDisplaysDataType | grep Resolution | awk '{print $2, $4}'`
      );
      
      // Check for Retina display
      const { stdout: retinaOutput } = await exec(
        `system_profiler SPDisplaysDataType | grep "Retina" || true`
      );
      
      const dimensions = resolutionOutput.trim().split(' ');
      const scalingFactor = retinaOutput.includes("Retina") ? 2 : 1;
      
      if (dimensions.length >= 2 && dimensions[0] && dimensions[1]) {
        return {
          width: parseInt(dimensions[0], 10),
          height: parseInt(dimensions[1], 10),
          scalingFactor
        };
      }
      
      throw new Error('Failed to determine screen dimensions on macOS');
    } catch (error) {
      throw new Error(`Failed to get screen dimensions: ${error}`);
    }
  }
  
  async takeScreenshot(outputPath: string): Promise<string> {
    try {
      // Use the built-in screencapture command on macOS
      const { stdout } = await exec(`screencapture -x "${outputPath}"`);
      return stdout;
    } catch (error) {
      throw new Error(`Failed to take screenshot: ${error}`);
    }
  }
}