/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { ConsoleLogger, Injectable, LogLevel, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService extends ConsoleLogger {
  constructor(context?: string) {
    super(context);
  }

  log(message: any, context?: string): void {
    super.log(message, context || this.context);
  }

  info(message: any, context?: string): void {
    this.log(message, context || this.context);
  }

  error(message: any, trace?: string, context?: string): void {
    super.error(message, trace, context || this.context);
  }

  warn(message: any, context?: string): void {
    super.warn(message, context || this.context);
  }

  debug(message: any, context?: string): void {
    super.debug(message, context || this.context);
  }

  verbose(message: any, context?: string): void {
    super.verbose(message, context || this.context);
  }

  setLogLevels(levels: LogLevel[]): void {
    super.setLogLevels(levels);
  }
}

// Create specialized loggers
export const mainLogger = new LoggerService('Main');
export const apiLogger = new LoggerService('API');
export const sessionLogger = new LoggerService('Session');
export const operatorLogger = new LoggerService('Operator');
export const configLogger = new LoggerService('Config');