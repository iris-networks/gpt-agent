/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SessionManagerService } from './services/session-manager.service';
import { SessionsController } from './sessions.controller';
import { ConfigModule } from '../config/config.module';
import { OperatorsModule } from '../operators/operators.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule,
    OperatorsModule,
  ],
  providers: [SessionManagerService],
  controllers: [SessionsController],
  exports: [SessionManagerService],
})
export class SessionsModule {}