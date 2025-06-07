/**
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */
import { SearchClient, SearchProvider } from '../src';

export async function browserSearch() {
  const client = new SearchClient({
    provider: SearchProvider.BrowserSearch,
    providerConfig: {
      // browser search config
    },
  });

  const results = await client.search(
    {
      query: 'UI-TARS',
      count: 10,
    },
    {
      concurrency: 3,
    },
  );

  console.log('Browser Search Results:');
  console.log(JSON.stringify(results, null, 2));
}

if (require.main === module) {
  browserSearch().catch(console.error);
}
