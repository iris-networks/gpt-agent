/**
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */

import { SearchClient, SearchProvider } from '../src';

export async function bingSearch() {
  const client = new SearchClient({
    provider: SearchProvider.BingSearch,
    providerConfig: {
      baseUrl: process.env.BING_SEARCH_API_BASE_URL,
      apiKey: process.env.BING_SEARCH_API_KEY,
    },
  });

  const results = await client.search(
    {
      query: 'UI-TARS',
      count: 5,
    },
    {
      mkt: 'zh-CN',
    },
  );

  console.log('Bing Search Results:');
  console.log(JSON.stringify(results, null, 2));
}

if (require.main === module) {
  bingSearch().catch(console.error);
}
