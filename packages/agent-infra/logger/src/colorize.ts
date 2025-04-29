/*
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */

// Check if running in browser environment
const isBrowser =
  typeof window !== 'undefined' && typeof window.document !== 'undefined';

// Check if color output is supported (Node.js environment)
const supportsColor =
  !isBrowser &&
  !('NO_COLOR' in process.env || process.env.FORCE_COLOR === '0') &&
  (process.env.FORCE_COLOR !== undefined || process.stdout?.isTTY);

/**
 * ANSI color codes for terminal output
 */
const ANSI_COLORS = {
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  reset: '\x1b[0m',
};

/**
 * CSS color values for browser console
 */
export const CSS_COLOR_VALUES = {
  black: '#000000',
  red: '#ff0000',
  green: '#00cc00',
  yellow: '#cc7700', // 更改为更深的橙黄色，提高在白色背景上的可读性
  blue: '#0066ff', // 稍微调整为更鲜明的蓝色
  magenta: '#cc00cc',
  cyan: '#00aaaa',
  white: '#ffffff',
  gray: '#808080',
  reset: 'inherit',
};

// CSS color styles for browser console
const CSS_COLORS: Record<string, string> = {};
Object.entries(CSS_COLOR_VALUES).forEach(([key, value]) => {
  CSS_COLORS[key] = `color: ${value}`;
});

export type ColorName = keyof typeof ANSI_COLORS;

/**
 * Adds color to text in both Node.js and browser environments
 * Returns formatted text for Node.js or special format for browser console
 *
 * @param text - The text to colorize
 * @param color - The color to apply
 * @returns Colorized text string
 */
export function colorize(text: string, color: ColorName): string {
  if (!text) return text;

  if (isBrowser) {
    // For browser, we still return the original text
    // The actual coloring happens in the log function
    return text;
  }

  // In Node.js environment, add ANSI color codes if supported
  if (supportsColor && ANSI_COLORS[color]) {
    return `${ANSI_COLORS[color]}${text}${ANSI_COLORS.reset}`;
  }

  // Return original text in environments without color support
  return text;
}

/**
 * Logs colored text in both browser and Node.js environments
 * Ensures consistent behavior across platforms
 *
 * @param text - The text to log with color
 * @param color - The color to apply
 */
export function colorLog(text: string, color: ColorName): void {
  if (isBrowser && CSS_COLORS[color]) {
    console.log(`%c${text}`, CSS_COLORS[color]);
  } else if (supportsColor) {
    console.log(colorize(text, color));
  } else {
    console.log(text);
  }
}
