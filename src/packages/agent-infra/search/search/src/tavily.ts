/**
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */
import {
  tavily,
  TavilyClientOptions,
  TavilySearchOptions,
  TavilySearchResponse,
} from '@tavily/core';

// rename to keep same naming style with other search providers.
export type TavilySearchConfig = TavilyClientOptions;
export type { TavilySearchOptions, TavilySearchResponse };

export { tavily };
