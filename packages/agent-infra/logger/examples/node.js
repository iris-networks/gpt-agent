/*
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */

// ESM example for Node.js
import { ConsoleLogger } from '../dist/index.mjs';

// Create a logger instance
const logger = new ConsoleLogger('[Node]');

// Basic logging
logger.info('This is an info message');
logger.warn('This is a warning message');
logger.error('This is an error message');
logger.success('This is a success message');

// Logging with data
logger.infoWithData(
  'User data:',
  { id: 1, name: 'John', email: 'john@example.com' },
  (user) => ({ ...user, email: '***@example.com' }),
);

// Hierarchical logging
const dbLogger = logger.spawn('DB');

dbLogger.info('Connected to database');
