/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { Module } from '@nestjs/common';
import { RpaController } from './controllers/rpa.controller';
import { RpaService } from './services/rpa.service';
import { OperatorsModule } from '../operators/operators.module';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
  imports: [
    OperatorsModule, // Import the operators module to use OperatorFactoryService
    SessionsModule,  // Import the sessions module to use VideoStorageService
  ],
  controllers: [RpaController],
  providers: [RpaService],
  exports: [RpaService],
})
export class RpaModule {}