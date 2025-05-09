/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { ApiProperty } from '@nestjs/swagger';
import { OperatorType } from '@app/shared/constants';
import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

/**
 * DTO for starting an RPA execution
 */
export class StartRpaExecutionDto {
  @ApiProperty({
    description: 'The ID of the recording containing caption data',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6'
  })
  @IsString()
  recordingId: string;

  @ApiProperty({
    description: 'Optional delay between actions in milliseconds',
    default: 1000,
    required: false,
    example: 1500
  })
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(10000)
  actionDelay?: number;
}

/**
 * Enum for RPA execution statuses
 */
export enum RpaExecutionStatus {
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  STOPPED = 'stopped'
}

/**
 * DTO for RPA execution status response
 */
export class RpaExecutionStatusDto {
  @ApiProperty({
    description: 'The ID of the RPA execution',
    example: 'rpa_1695872345678'
  })
  executionId: string;

  @ApiProperty({
    description: 'The ID of the recording being automated',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6'
  })
  recordingId: string;

  @ApiProperty({
    description: 'Current status of the execution',
    enum: RpaExecutionStatus,
    example: RpaExecutionStatus.RUNNING
  })
  status: RpaExecutionStatus;

  @ApiProperty({
    description: 'Current action index being executed',
    example: 3
  })
  currentActionIndex: number;

  @ApiProperty({
    description: 'Total number of actions to execute',
    example: 15
  })
  totalActions: number;

  @ApiProperty({
    description: 'Timestamp when the execution started',
    example: 1695872345678
  })
  startedAt: number;

  @ApiProperty({
    description: 'Operator type being used for execution',
    enum: OperatorType,
    example: OperatorType.BROWSER
  })
  operatorType: OperatorType;

  @ApiProperty({
    description: 'Error message if execution failed',
    required: false,
    example: 'Failed to execute click action: Element not found'
  })
  @IsOptional()
  errorMessage?: string;
}

/**
 * DTO for a simple success response
 */
export class SimpleSuccessResponseDto {
  @ApiProperty({
    description: 'Whether the operation was successful',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Optional message with additional details',
    required: false,
    example: 'RPA execution stopped successfully'
  })
  @IsOptional()
  message?: string;
}