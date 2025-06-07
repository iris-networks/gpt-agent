/**
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */
import { LocalBrowser } from '@agent-infra/browser';
import { ConsoleLogger } from '@agent-infra/logger';
import { SearchClient, SearchProvider } from '../src';

async function main() {
  const logger = new ConsoleLogger('[Search]');
  const browser = new LocalBrowser({ logger });
  const client = new SearchClient({
    provider: SearchProvider.BrowserSearch,
    providerConfig: {
      browser: browser,
      browserOptions: {
        headless: false,
      },
    },
  });

  // First search
  logger.info('Performing first search...');
  const firstResults = await client.search(
    {
      query: 'UI-TARS',
      count: 5,
    },
    {
      concurrency: 3,
      keepBrowserOpen: true,
    },
  );

  logger.info('');
  logger.info('----- First search results -----');
  console.log('');
  console.log(firstResults);

  // Second search, reusing the same browser instance
  logger.info('Performing second search...');
  const secondResults = await client.search(
    {
      query: 'AI Agents development',
      count: 3,
    },
    {
      concurrency: 2,
    },
  );

  logger.info('');
  logger.info('----- Second search results -----');
  console.log('');
  console.log(secondResults);

  // Close the browser after completion
  await browser.close();
  logger.info('Browser has been closed');
}

main().catch((error) => {
  console.error('Error during search:', error);
  process.exit(1);
});
