/*
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ConsoleLogger, LogLevel } from './index';

// Create a logger instance
const logger = new ConsoleLogger('TestLogger', LogLevel.DEBUG);

// Test different log methods
logger.debug('This is a debug message');
logger.info('This is an info message');
logger.success('This is a success message');
logger.warn('This is a warning message');
logger.error('This is an error message');

// Test infoWithData
logger.infoWithData('User data:', { id: 1, name: 'John' });

// Test spawn child logger
const childLogger = logger.spawn('Child');
childLogger.info('This is from the child logger');