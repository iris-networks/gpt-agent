import { promisify } from "util";
import { exec as execCallback } from "child_process";
import type { PlatformStrategy } from "../../../interfaces/platform-strategy-screen";

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
    try {
      // Get screen resolution using xrandr
      const { stdout: resolutionOutput } = await exec('xrandr | grep "*" | cut -d" " -f4');
      
      // Get scaling factor from gsettings if available (GNOME)
      const { stdout: scaleOutput } = await exec(
        'gsettings get org.gnome.desktop.interface scaling-factor 2>/dev/null || echo "1"'
      ).catch(() => ({ stdout: '1' }));
      
      const resolution = resolutionOutput.trim().split('x');
      const scalingFactor = parseInt(scaleOutput.trim(), 10) || 1;
      
      if (resolution.length >= 2 && resolution[0] && resolution[1]) {
        return {
          width: parseInt(resolution[0], 10),
          height: parseInt(resolution[1], 10),
          scalingFactor
        };
      }
      
      throw new Error('Failed to determine screen dimensions on Linux');
    } catch (error) {
      throw new Error(`Failed to get screen dimensions: ${error}`);
    }
  }

  private async checkDependencies(): Promise<void> {
    try {
      // Try to find either scrot or gnome-screenshot
      await exec('which scrot || which gnome-screenshot');
    } catch (error) {
      console.warn('Screenshot tools not found. Please install scrot or gnome-screenshot for Linux: sudo apt-get install scrot');
    }
  }

  async takeScreenshot(outputPath: string): Promise<string> {
    try {
      // Try to use scrot first, fall back to gnome-screenshot
      try {
        const { stdout } = await exec(`scrot "${outputPath}"`);
        return stdout;
      } catch (error) {
        // Fall back to gnome-screenshot
        const { stdout } = await exec(`gnome-screenshot -f "${outputPath}"`);
        return stdout;
      }
    } catch (error) {
      throw new Error(`Failed to take screenshot: ${error}`);
    }
  }
}