/*
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { PromiseQueue } from './promise-queue';

describe('PromiseQueue', () => {
  it('should execute tasks sequentially with concurrency 1', async () => {
    const queue = new PromiseQueue(1);
    const results: number[] = [];

    queue.add(
      () =>
        new Promise((resolve) =>
          setTimeout(() => {
            results.push(1);
            resolve(1);
          }, 100),
        ),
    );

    queue.add(
      () =>
        new Promise((resolve) =>
          setTimeout(() => {
            results.push(2);
            resolve(2);
          }, 50),
        ),
    );

    await queue.waitAll();
    expect(results).toEqual([1, 2]);
  });

  it('should handle errors gracefully', async () => {
    const queue = new PromiseQueue(1);
    const error = new Error('Test error');

    await expect(queue.add(() => Promise.reject(error))).rejects.toThrow(error);
  });

  it('should respect concurrency limit', async () => {
    const queue = new PromiseQueue(2);
    const running: number[] = [];
    const results: number[] = [];

    const task = (id: number) => () =>
      new Promise<number>((resolve) => {
        running.push(id);
        expect(running.length).toBeLessThanOrEqual(2);
        setTimeout(() => {
          results.push(id);
          running.splice(running.indexOf(id), 1);
          resolve(id);
        }, 100);
      });

    queue.add(task(1));
    queue.add(task(2));
    queue.add(task(3));
    queue.add(task(4));

    await queue.waitAll();
    expect(results).toEqual([1, 2, 3, 4]);
  });
});
