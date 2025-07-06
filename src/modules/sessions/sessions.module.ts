/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SessionManagerService } from './services/session-manager.service';
import { SessionsGateway } from './gateways/sessions.gateway';
import { SessionEventsService } from './services/session-events.service';
import { SessionScreenshotsService } from './services/session-screenshots.service';
import { VideoStorageService } from './services/video-storage.service';
import { VideoGeneratorService } from './services/video-generator.service';
import { VideosController } from './controllers/videos.controller';
import { VideoEditController } from './controllers/video-edit.controller';
import { SessionsController } from './controllers/sessions.controller';
import { ConfigModule } from '../config/config.module';
import { OperatorsModule } from '../operators/operators.module';
import { FileUploadModule } from '../file-upload/file-upload.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule,
    OperatorsModule,
    FileUploadModule
  ],
  controllers: [VideosController, VideoEditController, SessionsController],
  providers: [
    SessionEventsService,
    SessionScreenshotsService,
    SessionManagerService,
    SessionsGateway,
    VideoStorageService,
    VideoGeneratorService
  ],
  exports: [
    SessionManagerService,
    SessionsGateway,
    SessionEventsService,
    SessionScreenshotsService,
    VideoStorageService,
    VideoGeneratorService
  ],
})
export class SessionsModule {}