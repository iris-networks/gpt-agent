/**
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */
import { ConsoleLogger } from '@agent-infra/logger';
import { BrowserSearch } from '../src';

async function main() {
  const logger = new ConsoleLogger('[BrowserSearch]');
  const browserSearch = new BrowserSearch({
    logger,
    browserOptions: {
      headless: false,
    },
  });

  try {
    // First search, keep browser open
    logger.info('Performing first search');
    const results1 = await browserSearch.perform({
      query: 'ui-tars',
      count: 3,
      keepBrowserOpen: true, // Keep browser open
    });

    logger.info('First search results:', JSON.stringify(results1, null, 2));

    // Second search, reuse browser instance
    logger.info('Performing second search');
    const results2 = await browserSearch.perform({
      query: 'react hooks',
      count: 3,
      keepBrowserOpen: true, // Keep browser open
    });

    logger.info('Second search results:', JSON.stringify(results2, null, 2));

    // Explicitly close browser after completion
    await browserSearch.closeBrowser();
  } catch (error) {
    logger.error('Error:', error);
    // Ensure browser is closed even when an error occurs
    await browserSearch.closeBrowser();
  }
}

main();
