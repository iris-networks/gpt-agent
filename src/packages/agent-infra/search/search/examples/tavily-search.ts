/**
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */
import { SearchClient, SearchProvider } from '../src';

export async function tavilySearch() {
  const client = new SearchClient({
    provider: SearchProvider.Tavily,
    providerConfig: {
      apiKey: process.env.TAVILY_API_KEY,
    },
  });

  const results = await client.search(
    {
      query: 'UI-TARS',
      count: 5,
    },
    {
      searchDepth: 'advanced', // Tavily-specific parameter
      includeRawContent: true,
    },
  );

  console.log('Tavily Search Results:');
  console.log(JSON.stringify(results, null, 2));
}

if (require.main === module) {
  tavilySearch().catch(console.error);
}
