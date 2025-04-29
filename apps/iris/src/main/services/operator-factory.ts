/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { DefaultBrowserOperator } from '@ui-tars/operator-browser';
import { NutJSOperator as DefaultNutjsOperator } from '@ui-tars/operator-nut-js';
import { OperatorType } from '../../shared/constants';
import { operatorLogger } from '../utils/logger';

/**
 * Factory for creating different operator instances
 */
export class OperatorFactory {
  /**
   * Create a new operator instance based on the given type
   */
  public static async createOperator(type: OperatorType) {
    operatorLogger.info(`Creating operator of type: ${type}`);

    switch (type) {
      case OperatorType.BROWSER:
        // Create browser automation operator
        // Headless false for VNC visualization, no devtools, no sandbox in Docker
        const browserOperator = await DefaultBrowserOperator.getInstance(
          false,
          false,
          false,
        );
        operatorLogger.info('Browser operator created');
        return browserOperator;

      case OperatorType.COMPUTER:
        // Create computer automation operator with NutJS
        const computerOperator = new DefaultNutjsOperator();
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
  public static async closeOperator(operator: any, type: OperatorType) {
    operatorLogger.info(`Closing operator of type: ${type}`);

    if (!operator) {
      return;
    }

    try {
      await operator.close();
      operatorLogger.info(`Operator closed: ${type}`);
    } catch (error) {
      operatorLogger.error(`Failed to close operator: ${type}`, error);
    }
  }
}
