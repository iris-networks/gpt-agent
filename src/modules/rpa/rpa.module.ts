/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RpaController } from './controllers/rpa.controller';
import { VideoUploadController } from './controllers/video-upload.controller';
import { RpaService } from './services/rpa.service';
import { VideoProcessorService } from './services/video-processor.service';
import { GeminiAnalyzerService } from './services/gemini-analyzer.service';
import { OperatorsModule } from '../operators/operators.module';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
  imports: [
    ConfigModule,       // Import ConfigModule for environment variables
    OperatorsModule,    // Import the operators module to use OperatorFactoryService
    SessionsModule,     // Import the sessions module to use VideoStorageService
  ],
  controllers: [RpaController, VideoUploadController],
  providers: [RpaService, VideoProcessorService, GeminiAnalyzerService],
  exports: [RpaService, VideoProcessorService, GeminiAnalyzerService],
})
export class RpaModule {}