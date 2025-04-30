/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { OperatorType, SessionStatus } from '../../../shared/constants';
import { UpdateConfigDto } from '../../config/dto/config.dto';

export class CreateSessionDto {
  @ApiProperty({ description: 'Instructions for the automation task' })
  @IsString()
  instructions: string;

  @ApiPropertyOptional({ 
    description: 'Type of operator to use', 
    enum: OperatorType,
    default: OperatorType.BROWSER
  })
  @IsOptional()
  @IsEnum(OperatorType)
  operator?: OperatorType;

  @ApiPropertyOptional({ description: 'Configuration overrides for the session' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UpdateConfigDto)
  config?: UpdateConfigDto;
}

export class SessionResponseDto {
  @ApiProperty({ description: 'Session ID' })
  sessionId: string;

  @ApiProperty({ description: 'Session status', enum: SessionStatus })
  status: SessionStatus;

  @ApiProperty({ description: 'Operator type', enum: OperatorType })
  operator: OperatorType;

  @ApiPropertyOptional({ description: 'Conversation history' })
  conversations?: any[];

  @ApiPropertyOptional({ description: 'Error message if any' })
  errorMsg?: string;
}

export class CreateSessionResponseDto {
  @ApiProperty({ description: 'Session ID' })
  sessionId: string;
}

export class CancelSessionResponseDto {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;
}

export class ScreenshotResponseDto {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiPropertyOptional({ description: 'Base64 encoded screenshot' })
  screenshot?: string;

  @ApiPropertyOptional({ description: 'Error message if any' })
  error?: string;
}