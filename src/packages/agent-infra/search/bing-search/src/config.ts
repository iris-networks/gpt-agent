/**
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */
import { Logger } from '@agent-infra/logger';

/**
 * Bing Search API configuration interface
 */
export interface BingSearchConfig {
  /**
   * API base URL
   */
  baseUrl?: string;

  /**
   * API key
   */
  apiKey?: string;

  /**
   * Headers configuration
   */
  headers?: Record<string, string>;

  /**
   * Logger
   */
  logger?: Logger;
}

/**
 * Get Bing Search configuration
 */
export function getBingSearchConfig(
  options?: Partial<BingSearchConfig>,
): BingSearchConfig {
  const apiKey = options?.apiKey || process.env.BING_SEARCH_API_KEY || '';
  const baseUrl =
    options?.baseUrl ||
    process.env.BING_SEARCH_API_BASE_URL ||
    'https://api.bing.microsoft.com/v7.0';

  return {
    baseUrl,
    apiKey,
    headers: {
      'Ocp-Apim-Subscription-Key': apiKey,
      ...options?.headers,
    },
  };
}

export default getBingSearchConfig();
