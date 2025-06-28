/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { ConsoleLogger, Injectable, LogLevel, Scope } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService extends ConsoleLogger {
  private logFilePath: string;

  constructor(context?: string) {
    super(context);
    this.logFilePath = '/home/nodeuser/iris.log';
    this.ensureLogDirectoryExists();
  }

  private ensureLogDirectoryExists(): void {
    const logDir = path.dirname(this.logFilePath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  private writeToFile(level: string, message: any, context?: string, trace?: string): void {
    try {
      const timestamp = new Date().toISOString();
      const contextStr = context ? `[${context}]` : '';
      const traceStr = trace ? `\nStack: ${trace}` : '';
      const logEntry = `${timestamp} [${level.toUpperCase()}] ${contextStr} ${message}${traceStr}\n`;
      
      fs.appendFileSync(this.logFilePath, logEntry, 'utf8');
    } catch (error) {
      // Silently fail to avoid infinite loops
    }
  }

  log(message: any, context?: string): void {
    super.log(message, context || this.context);
    this.writeToFile('log', message, context || this.context);
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
      this.writeToFile('error', `${message.message} (at ${fileLineInfo})`, context || this.context, message.stack);
    } else {
      super.error(message, trace || 'No stack trace available', context || this.context);
      this.writeToFile('error', message, context || this.context, trace || 'No stack trace available');
    }
  }

  warn(message: any, context?: string): void {
    super.warn(message, context || this.context);
    this.writeToFile('warn', message, context || this.context);
  }

  debug(message: any, context?: string): void {
    super.debug(message, context || this.context);
    this.writeToFile('debug', message, context || this.context);
  }

  verbose(message: any, context?: string): void {
    super.verbose(message, context || this.context);
    this.writeToFile('verbose', message, context || this.context);
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