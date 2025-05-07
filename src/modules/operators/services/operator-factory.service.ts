/**
 * SPDX-License-Identifier: Proprietary
 * Copyright: Proprietary
 */

import { Injectable } from '@nestjs/common';
import { NutJSOperator as DefaultNutjsOperator } from '@ui-tars/operator-nut-js';
import { OperatorType } from '../../../shared/constants';
import { operatorLogger } from '../../../common/services/logger.service';
import { IrisBrowserOperator } from './IrisBrowserOperator';

@Injectable()
export class OperatorFactoryService {
  /**
   * Create a new operator instance based on the given type
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
  async closeOperator(operator: any, type: OperatorType) {
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