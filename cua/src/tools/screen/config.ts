/**
 * Screen configuration parameters
 */
export interface ScreenConfig {
  width?: number;
  height?: number;
  scalingFactor?: number;
  display?: string;
}

/**
 * Get screen dimensions and display settings from environment variables or use defaults
 */
export function getScreenConfig(): ScreenConfig {
  return {
    width: process.env.SCREEN_WIDTH ? parseInt(process.env.SCREEN_WIDTH, 10) : undefined,
    height: process.env.SCREEN_HEIGHT ? parseInt(process.env.SCREEN_HEIGHT, 10) : undefined,
    scalingFactor: process.env.SCREEN_SCALING_FACTOR ? 
      parseFloat(process.env.SCREEN_SCALING_FACTOR) : undefined,
    display: process.env.DISPLAY || undefined
  };
}