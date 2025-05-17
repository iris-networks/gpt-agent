/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { IsString, IsOptional, IsEnum, ValidateNested, IsObject, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { OperatorType, SessionStatus } from '../../../shared/constants';
import { UpdateConfigDto } from '../../config/dto/config.dto';

/**
 * File metadata DTO
 */
export class FileMetadataDto {
  @IsString()
  fileId: string;

  @IsString()
  fileName: string;

  @IsOptional()
  @IsString()
  originalName?: string;

  @IsString()
  mimeType: string;

  @IsNumber()
  fileSize: number;
}

/**
 * Data transfer object for session creation request
 */
export class CreateSessionDto {
  @IsString()
  instructions: string;

  @IsOptional()
  @IsEnum(OperatorType)
  operator?: OperatorType;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UpdateConfigDto)
  config?: UpdateConfigDto;

  @IsOptional()
  @IsString({ each: true })
  fileIds?: string[]; // Array of file IDs that are attached to this session

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FileMetadataDto)
  files?: FileMetadataDto[]; // Array of file metadata objects
}

/**
 * Data transfer object for session response
 */
export class SessionResponseDto {
  sessionId: string;
  status: SessionStatus;
  operator: OperatorType;
  conversations?: any[];
  errorMsg?: string;
  fileIds?: string[]; // Array of file IDs that are attached to this session
  files?: FileMetadataDto[]; // Array of file metadata objects
}

/**
 * DTO for screenshot response
 */
export class ScreenshotResponseDto {
  success: boolean;
  screenshot?: string;
  error?: string;
}