import { promisify } from "util";
import { exec as execCallback } from "child_process";
import type { PlatformStrategy } from "../../../interfaces/platform-strategy-screen";
import { getScreenConfig } from "../config";

const exec = promisify(execCallback);

/**
 * Linux implementation using scrot or gnome-screenshot
 */
export class LinuxStrategy implements PlatformStrategy {
  constructor() {
    // Check if screenshot tools are installed
    this.checkDependencies();
  }

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

  private async checkDependencies(): Promise<void> {
    try {
      // Get display setting from config
      const config = getScreenConfig();
      const displayEnv = config.display ? { DISPLAY: config.display } : {};
      
      // Set environment variables for the exec call
      const execOptions = { env: { ...process.env, ...displayEnv } };
      
      // Try to find either scrot or gnome-screenshot
      await exec('which scrot || which gnome-screenshot', execOptions);
    } catch (error) {
      console.warn('Screenshot tools not found. Please install scrot or gnome-screenshot for Linux: sudo apt-get install scrot');
    }
  }

  async takeScreenshot(outputPath: string): Promise<string> {
    try {
      // Get display setting from config
      const config = getScreenConfig();
      const displayEnv = config.display ? { DISPLAY: config.display } : {};
      
      // Set environment variables for the exec call
      const execOptions = { env: { ...process.env, ...displayEnv } };
      
      // Try to use scrot first, fall back to gnome-screenshot
      try {
        const { stdout } = await exec(`scrot "${outputPath}"`, execOptions);
        return stdout;
      } catch (error) {
        // Fall back to gnome-screenshot
        const { stdout } = await exec(`gnome-screenshot -f "${outputPath}"`, execOptions);
        return stdout;
      }
    } catch (error) {
      throw new Error(`Failed to take screenshot: ${error}`);
    }
  }
}