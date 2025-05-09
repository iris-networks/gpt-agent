/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from './modules/config/config.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { OperatorsModule } from './modules/operators/operators.module';
import { RpaModule } from './modules/rpa/rpa.module';
import { StorageModule } from './modules/storage/storage.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule,
    SessionsModule,
    OperatorsModule,
    RpaModule,
    StorageModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'public'),
    }),
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}