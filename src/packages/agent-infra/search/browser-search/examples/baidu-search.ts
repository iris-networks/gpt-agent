/**
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */
import { ConsoleLogger } from '@agent-infra/logger';
import { BrowserSearch } from '../src';

export async function baiduSearch() {
  const logger = new ConsoleLogger('[BaiduSearch]');
  const browserSearch = new BrowserSearch({
    logger,
    browserOptions: {
      headless: false,
    },
  });

  try {
    logger.info('Performing Baidu search');
    const results = await browserSearch.perform({
      query: 'GUI Agent',
      count: 5,
      engine: 'baidu',
    });

    logger.info(`Baidu search found ${results.length} results`);
    logger.info(JSON.stringify(results, null, 2));

    return results;
  } finally {
    await browserSearch.closeBrowser();
  }
}

// Execute when this file is run directly
if (require.main === module) {
  baiduSearch().catch(console.error);
}
