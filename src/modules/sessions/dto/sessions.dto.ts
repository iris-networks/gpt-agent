/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { IsString, IsOptional, IsEnum, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { OperatorType, SessionStatus } from '../../../shared/constants';
import { UpdateConfigDto } from '../../config/dto/config.dto';

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
}

/**
 * DTO for screenshot response
 */
export class ScreenshotResponseDto {
  success: boolean;
  screenshot?: string;
  error?: string;
}