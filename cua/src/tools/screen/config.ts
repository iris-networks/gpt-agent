/**
 * Screen configuration parameters
 */
export interface ScreenConfig {
  width: number;
  height: number;
  scalingFactor: number;
  display?: string;
}

/**
 * Default screen configuration values
 */
const DEFAULT_SCREEN_WIDTH = 1920;
const DEFAULT_SCREEN_HEIGHT = 1080;
const DEFAULT_SCALING_FACTOR = 1;

/**
 * Get screen dimensions and display settings from environment variables or use defaults
 */
export function getScreenConfig(): ScreenConfig {
  return {
    width: process.env.SCREEN_WIDTH ? parseInt(process.env.SCREEN_WIDTH, 10) : DEFAULT_SCREEN_WIDTH,
    height: process.env.SCREEN_HEIGHT ? parseInt(process.env.SCREEN_HEIGHT, 10) : DEFAULT_SCREEN_HEIGHT,
    scalingFactor: process.env.SCREEN_SCALING_FACTOR ? 
      parseFloat(process.env.SCREEN_SCALING_FACTOR) : DEFAULT_SCALING_FACTOR,
    display: process.env.DISPLAY || undefined
  };
}