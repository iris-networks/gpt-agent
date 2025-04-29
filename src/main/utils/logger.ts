/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

// Simple console-based logger implementation
const createLogger = (namespace: string) => {
  return {
    info: (message: string, ...args: any[]) => {
      console.log(`[${namespace}] ${message}`, ...args);
    },
    error: (message: string | Error, ...args: any[]) => {
      if (message instanceof Error) {
        console.error(
          `[${namespace}] ${message.message}`,
          message.stack,
          ...args,
        );
      } else {
        console.error(`[${namespace}] ${message}`, ...args);
      }
    },
    warn: (message: string, ...args: any[]) => {
      console.warn(`[${namespace}] ${message}`, ...args);
    },
    debug: (message: string, ...args: any[]) => {
      console.debug(`[${namespace}] ${message}`, ...args);
    },
  };
};

export const mainLogger = createLogger('main');
export const apiLogger = createLogger('api');
export const sessionLogger = createLogger('session');
export const operatorLogger = createLogger('operator');

export default createLogger;
