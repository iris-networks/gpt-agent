# @agent-infra/bing-search

<p>
  <a href="https://npmjs.com/package/@agent-infra/bing-search?activeTab=readme"><img src="https://img.shields.io/npm/v/@agent-infra/bing-search?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" /></a>
  <a href="https://npmcharts.com/compare/@agent-infra/bing-search?minimal=true"><img src="https://img.shields.io/npm/dm/@agent-infra/bing-search.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="downloads" /></a>
  <a href="https://nodejs.org/en/about/previous-releases"><img src="https://img.shields.io/node/v/@agent-infra/bing-search.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="node version"></a>
  <a href="https://github.com/web-infra-dev/rsbuild/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="license" /></a>
</p>

A lightweight TypeScript client for Bing Search API, designed for AI applications.

## Features

- **Type-safe**: Full TypeScript support with comprehensive type definitions
- **Configurable**: Customizable search parameters and API settings
- **Minimal**: Zero external runtime dependencies
- **Developer-friendly**: Clean API with Promise-based interface

## Installation

```bash
npm install @agent-infra/bing-search
# or
yarn add @agent-infra/bing-search
# or
pnpm add @agent-infra/bing-search
```

## Usage

### Basic Search

```typescript
import { BingSearchClient } from '@agent-infra/bing-search';

const client = new BingSearchClient({
  apiKey: 'YOUR_API_KEY',
});

const results = await client.search({
  q: 'climate change',
  count: 5,
});

console.log(results.webPages?.value);
```

### With Environment Variables

```typescript
// Set in your environment:
// BING_SEARCH_API_KEY=your-api-key

import { BingSearchClient } from '@agent-infra/bing-search';

const client = new BingSearchClient();
const results = await client.search({ q: 'renewable energy' });
```

### With Custom Logger

```typescript
import { ConsoleLogger } from '@agent-infra/logger';
import { BingSearchClient } from '@agent-infra/bing-search';

const logger = new ConsoleLogger('[BingSearch]');
const client = new BingSearchClient({
  apiKey: 'YOUR_API_KEY',
  logger,
});

const results = await client.search({ q: 'machine learning' });
```

## API Reference

### BingSearchClient

```typescript
constructor(config?: Partial<BingSearchConfig>)
```

Configuration options:

```typescript
interface BingSearchConfig {
  baseUrl?: string; // Default: 'https://api.bing.microsoft.com/v7.0'
  apiKey?: string; // Bing API subscription key
  headers?: Record<string, string>;
  logger?: Logger;
}
```

### Search Method

```typescript
async search(params: BingSearchOptions): Promise<BingSearchResponse>
```

Search options:

```typescript
interface BingSearchOptions {
  q: string; // Search query (required)
  count?: number; // Number of results to return
  offset?: number; // Result offset for pagination
  mkt?: string; // Market code (e.g., 'en-US')
  safeSearch?: 'Off' | 'Moderate' | 'Strict';
  [key: string]: any; // Additional parameters
}
```

### Response Types

```typescript
interface BingSearchResponse {
  webPages?: {
    value: WebPage[];
    totalEstimatedMatches?: number;
    webSearchUrl?: string;
  };
  images?: {
    value: Image[];
    // ...
  };
  videos?: {
    value: Video[];
    // ...
  };
  // Additional response fields
}
```

## Examples

See [examples](./examples/).


## License

Copyright (c) 2025 ByteDance, Inc. and its affiliates.

Licensed under the Apache License, Version 2.0.
