/**
 * SPDX-License-Identifier: Proprietary
 * Copyright: Proprietary
 */

import { Injectable } from '@nestjs/common';
import { OperatorType } from '../../../shared/constants';
import { operatorLogger } from '../../../common/services/logger.service';
import { NutJSOperator } from '@app/packages/ui-tars/operators/nut-js/src';
import { IrisBrowserOperator } from './IrisBrowserOperator';

/**
 * Factory service for creating automation operators
 * This service abstracts the creation and management of different interaction mechanisms
 * enabling the system to work with both browsers and native desktop applications
 */
@Injectable()
export class OperatorFactoryService {
  /**
   * Create a new operator instance based on the given type
   * This allows the system to switch between different interaction methods
   * based on the specific task requirements and target environments
   */
  async createOperator(type: OperatorType) {
    operatorLogger.info(`Creating operator of type: ${type}`);

    switch (type) {
      case OperatorType.BROWSER:
        // Create browser automation operator
        // Headless false for VNC visualization, no devtools, no sandbox in Docker
        const browserOperator = await IrisBrowserOperator.getInstance(
          false,
          false,
          false,
        );
        operatorLogger.info('Browser operator created');
        return browserOperator;

      case OperatorType.COMPUTER:
        // Create computer automation operator with NutJS
        const computerOperator = new NutJSOperator();
        operatorLogger.info('Computer operator created');
        return computerOperator;

      default:
        operatorLogger.error(`Unknown operator type: ${type}`);
        throw new Error(`Unknown operator type: ${type}`);
    }
  }

  /**
   * Close an operator instance
   */
  async closeOperator(operator: any, type: OperatorType) {
    operatorLogger.info(`Closing operator of type: ${type}`);

    if (!operator) {
      return;
    }

    try {
      console.error("operator.close is not implemented.")
      // await operator.close();
      operatorLogger.info(`Operator closed: ${type}`);
    } catch (error) {
      operatorLogger.error(`Failed to close operator: ${type}`, error);
    }
  }
}