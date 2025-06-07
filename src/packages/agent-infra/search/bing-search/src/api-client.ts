/**
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Logger, defaultLogger } from '@agent-infra/logger';
import { BingSearchConfig, getBingSearchConfig } from './config';

/**
 * Options for performing a Bing search
 */
export interface BingSearchOptions {
  /**
   * Search query string
   */
  q: string;

  /**
   * Number of results to return
   */
  count?: number;

  /**
   * Result offset for pagination
   */
  offset?: number;

  /**
   * Market code (e.g., 'en-US')
   */
  mkt?: string;

  /**
   * Safe search filtering level
   */
  safeSearch?: 'Off' | 'Moderate' | 'Strict';

  /**
   * Additional parameters supported by Bing Search API
   */
  [key: string]: any;
}

/**
 * Represents a web page result from Bing Search
 */
export interface WebPage {
  /**
   * Title of the web page
   */
  name: string;

  /**
   * URL of the web page
   */
  url: string;

  /**
   * Text snippet from the web page
   */
  snippet: string;

  /**
   * Date the page was last crawled by Bing
   */
  dateLastCrawled?: string;

  /**
   * Display URL for the web page
   */
  displayUrl?: string;

  /**
   * Unique identifier for the result
   */
  id?: string;

  /**
   * Indicates if the content is family friendly
   */
  isFamilyFriendly?: boolean;

  /**
   * Indicates if the result is navigational
   */
  isNavigational?: boolean;

  /**
   * Language of the web page
   */
  language?: string;

  /**
   * Indicates if caching should be disabled
   */
  noCache?: boolean;

  /**
   * Name of the website
   */
  siteName?: string;

  /**
   * URL to a thumbnail image
   */
  thumbnailUrl?: string;
}

/**
 * Represents an image result from Bing Search
 */
export interface Image {
  contentSize: string;
  contentUrl: string;
  datePublished: string;
  encodingFormat: string;
  height: number;
  width: number;
  hostPageDisplayUrl: string;
  hostPageUrl: string;
  name: string;
  thumbnail: {
    height: number;
    width: number;
  };
  thumbnailUrl: string;
  webSearchUrl: string;
}

/**
 * Represents a video result from Bing Search
 */
export interface Video {
  allowHttpsEmbed: boolean;
  allowMobileEmbed: boolean;
  contentUrl: string;
  creator?: {
    name: string;
  };
  datePublished: string;
  description: string;
  duration: string;
  embedHtml: string;
  encodingFormat: string;
  height: number;
  width: number;
  hostPageDisplayUrl: string;
  hostPageUrl: string;
  name: string;
  publisher?: {
    name: string;
  }[];
  thumbnail: {
    height: number;
    width: number;
  };
  thumbnailUrl: string;
  viewCount?: number;
  webSearchUrl: string;
}

export interface BingSearchResponse {
  _type?: string;
  queryContext?: {
    originalQuery: string;
  };
  webPages?: {
    value: WebPage[];
    totalEstimatedMatches?: number;
    someResultsRemoved?: boolean;
    webSearchUrl?: string;
  };
  images?: {
    value: Image[];
    isFamilyFriendly?: boolean;
    readLink?: string;
    webSearchUrl?: string;
    id?: string;
  };
  videos?: {
    value: Video[];
    isFamilyFriendly?: boolean;
    readLink?: string;
    webSearchUrl?: string;
    id?: string;
    scenario?: string;
  };
  rankingResponse?: {
    mainline?: {
      items: {
        answerType: string;
        resultIndex?: number;
        value: {
          id: string;
        };
      }[];
    };
  };
  [key: string]: any; // Allow other response fields
}

/**
 * Client for interacting with Bing Search API
 */
export class BingSearchClient {
  private config: BingSearchConfig;
  private logger: Logger;

  /**
   * Creates a new instance of BingSearchClient
   *
   * @param config - Configuration options for the client
   */
  constructor(config?: Partial<BingSearchConfig>) {
    // Merge default config with user-provided config
    this.config = getBingSearchConfig(config);
    this.logger = config?.logger ?? defaultLogger;
    this.logger.log('client config', this.config);
  }

  /**
   * Perform Bing search
   * @param params Search parameters
   * @returns Search results
   */
  async search(params: BingSearchOptions): Promise<BingSearchResponse> {
    this.logger.log('search params', params);
    const { baseUrl, headers } = this.config;

    // Build query parameters
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    try {
      const response = await fetch(`${baseUrl}?${queryParams}`, {
        method: 'GET',
        headers: {
          ...headers,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Bing search failed: ${response.status} ${response.statusText}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Error performing Bing search:', error);
      throw error;
    }
  }
}

export const bingSearchClient = new BingSearchClient();
