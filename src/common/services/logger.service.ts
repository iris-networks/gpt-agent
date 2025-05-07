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
    if (message instanceof Error) {
      const stack = message.stack || '';
      const stackLines = stack.split('\n');
      // Extract file and line information from stack trace if available
      const fileLineInfo = stackLines.length > 1 ? 
        stackLines[1].trim().replace(/^at /, '') : 
        'unknown location';
      
      super.error(`${message.message} (at ${fileLineInfo})`, message.stack, context || this.context);
    } else {
      super.error(message, trace || 'No stack trace available', context || this.context);
    }
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