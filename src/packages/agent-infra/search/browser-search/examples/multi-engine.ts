/**
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */
import { ConsoleLogger } from '@agent-infra/logger';
import { googleSearch } from './google-search';
import { bingSearch } from './bing-search';
import { githubSearch } from './github-search';
import { baiduSearch } from './baidu-search';

async function multiEngineSearch() {
  const logger = new ConsoleLogger('[BrowserSearch]');

  try {
    // Execute searches with different search engines
    const googleResults = await googleSearch();
    const bingResults = await bingSearch();
    const githubResults = await githubSearch();
    const baiduResults = await baiduSearch();

    // Compare results
    logger.info('Search results comparison:');
    logger.info(`Google: ${googleResults.length} results`);
    logger.info(`Bing: ${bingResults.length} results`);
    logger.info(`GitHub: ${githubResults.length} results`);
    logger.info(`Baidu: ${baiduResults.length} results`);
  } catch (error) {
    logger.error('Error during multi-engine search:', error);
  }
}

if (require.main === module) {
  multiEngineSearch().catch(console.error);
}
