/**
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Safely parses a URL string into a URL object
 * @param url - The URL string to parse
 * @returns URL object or null if invalid
 */
const parseUrl = (url: string) => {
  try {
    return new URL(url);
  } catch {
    return null;
  }
};

/**
 * Determines if a domain should be skipped based on a blocklist
 * @param url - The URL to check
 * @returns True if the domain should be skipped, false otherwise
 */
export const shouldSkipDomain = (url: string) => {
  const parsed = parseUrl(url);
  if (!parsed) return true;

  const { hostname } = parsed;
  return [
    'reddit.com',
    'www.reddit.com',
    'x.com',
    'twitter.com',
    'www.twitter.com',
    'youtube.com',
    'www.youtube.com',
  ].includes(hostname);
};
