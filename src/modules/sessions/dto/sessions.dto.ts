/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { IsString, IsOptional, IsEnum, ValidateNested, IsObject, IsNumber, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { OperatorType } from '../../../shared/constants';
import { UpdateConfigDto } from '../../config/dto/config.dto';
import { StatusEnum } from '@app/packages/ui-tars/shared/src/types';

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

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  composioApps?: string[]; // Array of Composio app names (e.g., ["github", "slack", "notion"])

  @IsOptional()
  @IsString()
  entityId?: string; // Entity ID for Composio tools
}

/**
 * Data transfer object for continuing an existing session
 */
export class ContinueSessionDto {
  @IsString()
  instructions: string;

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
  status: StatusEnum;
  operator: OperatorType;
  conversations?: any[];
  errorMsg?: string;
  fileIds?: string[]; // Array of file IDs that are attached to this session
  files?: FileMetadataDto[]; // Array of file metadata objects
  composioApps?: string[]; // Array of Composio app names
}

/**
 * DTO for screenshot response
 */
export class ScreenshotResponseDto {
  success: boolean;
  screenshot?: string;
  error?: string;
}