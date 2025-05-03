/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SessionManagerService } from './services/session-manager.service';
import { SessionsGateway } from './gateways/sessions.gateway';
import { SessionEventsService } from './services/session-events.service';
import { ConfigModule } from '../config/config.module';
import { OperatorsModule } from '../operators/operators.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule,
    OperatorsModule,
  ],
  providers: [SessionEventsService, SessionManagerService, SessionsGateway],
  exports: [SessionManagerService, SessionsGateway, SessionEventsService],
})
export class SessionsModule {}