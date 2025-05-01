/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { Module } from '@nestjs/common';
import { OperatorFactoryService } from './services/operator-factory.service';
import { OperatorsController } from './operators.controller';

@Module({
  providers: [OperatorFactoryService],
  controllers: [OperatorsController],
  exports: [OperatorFactoryService],
})
export class OperatorsModule {}