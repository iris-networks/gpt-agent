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
import { FileUploadModule } from './modules/file-upload/file-upload.module';
import { IrisArtifactsModule } from './modules/iris-artifacts/iris-artifacts.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { HealthController } from './controllers/health.controller';

@Module({
  imports: [
    ConfigModule,
    SessionsModule,
    OperatorsModule,
    RpaModule,
    FileUploadModule,
    IrisArtifactsModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'public'),
    }),
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}