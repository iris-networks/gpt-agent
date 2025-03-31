import type { DisplayConfig } from '../../config/display';
import { getDisplayConfig } from '../../config/display';

/**
 * Re-export the types and functions from the centralized display config
 */
export type ScreenConfig = DisplayConfig;
export const getScreenConfig = getDisplayConfig;