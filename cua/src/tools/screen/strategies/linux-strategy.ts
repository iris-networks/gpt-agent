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
    // Get config values from environment variables
    const config = getScreenConfig();
    const displayEnv = config.display ? { DISPLAY: config.display } : {};
    
    // Set environment variables for the exec call
    const execOptions = { env: { ...process.env, ...displayEnv } };
    
    // If all dimensions are provided in environment variables, use those
    if (config.width && config.height && config.scalingFactor) {
      return {
        width: config.width,
        height: config.height,
        scalingFactor: config.scalingFactor
      };
    }
    
    try {
      // Get screen resolution using xrandr if width or height not provided
      let width = config.width;
      let height = config.height;
      
      if (!width || !height) {
        const { stdout: resolutionOutput } = await exec('xrandr | grep "*" | cut -d" " -f4', execOptions);
        const resolution = resolutionOutput.trim().split('x');
        
        if (resolution.length >= 2 && resolution[0] && resolution[1]) {
          width = width || parseInt(resolution[0], 10);
          height = height || parseInt(resolution[1], 10);
        } else {
          throw new Error('Failed to determine screen dimensions on Linux');
        }
      }
      
      // Get scaling factor from gsettings if not provided
      let scalingFactor = config.scalingFactor;
      
      if (!scalingFactor) {
        const { stdout: scaleOutput } = await exec(
          'gsettings get org.gnome.desktop.interface text-scaling-factor >/dev/null || echo "1"',
          execOptions
        ).catch(() => ({ stdout: '1' }));
        
        scalingFactor = parseInt(scaleOutput.trim(), 10) || 1;
      }
      
      return { width, height, scalingFactor };
    } catch (error) {
      throw new Error(`Failed to get screen dimensions: ${error}`);
    }
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