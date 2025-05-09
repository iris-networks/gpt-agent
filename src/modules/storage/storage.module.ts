/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MinioStorageService } from './services/minio-storage.service';
import { FileUploadController } from './controllers/file-upload.controller';

@Module({
  imports: [ConfigModule],
  controllers: [FileUploadController],
  providers: [MinioStorageService],
  exports: [MinioStorageService],
})
export class StorageModule {}