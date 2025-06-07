/**
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */
import { ConsoleLogger } from '@agent-infra/logger';
import { BingSearchClient } from '../src';

async function runExample() {
  const logger = new ConsoleLogger('[BingSearch]');
  try {
    const client = new BingSearchClient({
      baseUrl: process.env.BING_SEARCH_API_BASE_URL,
      apiKey: process.env.BING_SEARCH_API_KEY,
      logger,
    });
    const results = await client.search({
      q: 'UI-TARS',
      count: 5,
    });
    console.log(JSON.stringify(results.webPages, null, 2));
    console.log(`Found ${results.webPages?.value.length || 0} results`);
  } catch (error) {
    console.error('Search with options failed:', error);
  }
}

if (require.main === module) {
  runExample().catch(console.error);
}
