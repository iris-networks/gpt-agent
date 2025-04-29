/*
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Interface representing extracted page information
 */
interface PageInfo {
  /** Page title */
  title: string;
  /** Page content in HTML format */
  content: string;
}

/**
 * Extracts readable content from a web page using Readability
 * @param window Browser window object
 * @param readabilityScript Readability library script as string
 * @returns Extracted page information (title and content)
 */
export function extractPageInformation(
  window: Window,
  readabilityScript: string,
): PageInfo {
  const Readability = new Function(
    'module',
    `${readabilityScript}\nreturn module.exports`,
  )({});

  const document = window.document;

  // Remove non-content elements to improve extraction quality
  document
    .querySelectorAll(
      'script,noscript,style,link,svg,img,video,iframe,canvas,.reflist',
    )
    .forEach((el) => el.remove());

  // Parse the document using Readability
  const article = new Readability(document).parse();
  const content = article?.content || '';
  const title = document.title;

  return {
    content,
    title: article?.title || title,
  };
}
