/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { OperatorType } from '../../../shared/constants';

export class ConfigResponseDto {
  @ApiProperty({ description: 'VLM Base URL' })
  vlmBaseUrl: string;

  @ApiProperty({ description: 'VLM API Key' })
  vlmApiKey: string;

  @ApiProperty({ description: 'VLM Model Name' })
  vlmModelName: string;

  @ApiProperty({ description: 'VLM Provider' })
  vlmProvider: string;

  @ApiProperty({ description: 'Language' })
  language: string;

  @ApiProperty({ description: 'Default Operator Type', enum: OperatorType })
  defaultOperator: OperatorType;

  @ApiProperty({ description: 'Maximum Loop Count' })
  maxLoopCount: number;

  @ApiProperty({ description: 'Loop Interval in Milliseconds' })
  loopIntervalInMs: number;
}

export class UpdateConfigDto {
  @ApiPropertyOptional({ description: 'VLM Base URL' })
  @IsOptional()
  @IsString()
  vlmBaseUrl?: string;

  @ApiPropertyOptional({ description: 'VLM API Key' })
  @IsOptional()
  @IsString()
  vlmApiKey?: string;

  @ApiPropertyOptional({ description: 'VLM Model Name' })
  @IsOptional()
  @IsString()
  vlmModelName?: string;

  @ApiPropertyOptional({ description: 'VLM Provider' })
  @IsOptional()
  @IsString()
  vlmProvider?: string;

  @ApiPropertyOptional({ description: 'Language' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ description: 'Default Operator Type', enum: OperatorType })
  @IsOptional()
  @IsEnum(OperatorType)
  defaultOperator?: OperatorType;

  @ApiPropertyOptional({ description: 'Maximum Loop Count' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxLoopCount?: number;

  @ApiPropertyOptional({ description: 'Loop Interval in Milliseconds' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  loopIntervalInMs?: number;
}