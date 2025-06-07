/*
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Task<T> {
  (): Promise<T>;
}

export class PromiseQueue {
  private queue: Task<any>[] = [];

  private concurrency: number;

  private running = 0;

  private results: any[] = [];

  constructor(concurrency = 1) {
    this.concurrency = concurrency;
  }

  add<T>(task: Task<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result);
          return result;
        } catch (error) {
          reject(error);
          throw error;
        }
      });
      this.run();
    });
  }

  private async run() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }

    this.running++;
    const task = this.queue.shift()!;

    try {
      const result = await task();
      this.results.push(result);
    } catch (error) {
      // Handle error if needed
    } finally {
      this.running--;
      this.run();
    }
  }

  async waitAll(): Promise<any[]> {
    while (this.running > 0 || this.queue.length > 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return this.results;
  }
}
