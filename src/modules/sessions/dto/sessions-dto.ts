/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsObject, IsString, IsOptional, IsBoolean, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { OperatorType } from '@app/shared/constants';
import { Conversation } from '@app/packages/ui-tars/shared/src/types';

/**
 * Video generation status enum
 */
export enum VideoGenerationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

/**
 * Screenshot DTO
 */
export class ScreenshotDto {
  @ApiProperty({
    description: 'Base64 encoded screenshot image',
    type: String
  })
  @IsString()
  base64: string;

  @ApiProperty({
    description: 'Timestamp when the screenshot was taken',
    type: Number
  })
  @IsNumber()
  timestamp: number;

  @ApiProperty({
    description: 'Conversation object containing the caption text and metadata',
    type: Object
  })
  @IsObject()
  conversation: Conversation;
}

/**
 * Video recording metadata DTO
 */
export class VideoRecordingDto {
  @ApiProperty({
    description: 'Unique identifier for the recording',
    type: String
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Session ID this recording belongs to',
    type: String
  })
  @IsString()
  sessionId: string;

  @ApiProperty({
    description: 'Title of the recording',
    type: String
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Description of the recording',
    type: String
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Timestamp when the recording was created',
    type: Number
  })
  @IsNumber()
  createdAt: number;

  @ApiProperty({
    description: 'Duration of the recording in milliseconds',
    type: Number
  })
  @IsNumber()
  duration: number;

  @ApiProperty({
    description: 'Number of frames in the recording',
    type: Number
  })
  @IsNumber()
  frameCount: number;

  @ApiPropertyOptional({
    description: 'Path to the thumbnail image',
    type: String
  })
  @IsOptional()
  @IsString()
  thumbnailPath?: string;

  @ApiProperty({
    description: 'Path to the recording files',
    type: String
  })
  @IsString()
  filePath: string;

  @ApiProperty({
    description: 'Size of the recording in bytes',
    type: Number
  })
  @IsNumber()
  size: number;

  @ApiPropertyOptional({
    description: 'Operator type used for the session',
    enum: OperatorType
  })
  @IsOptional()
  @IsEnum(OperatorType)
  operatorType?: OperatorType;

  @ApiPropertyOptional({
    description: 'Status of video generation',
    enum: VideoGenerationStatus
  })
  @IsOptional()
  @IsEnum(VideoGenerationStatus)
  videoGenerationStatus?: VideoGenerationStatus;

  @ApiPropertyOptional({
    description: 'Timestamp when video generation started',
    type: Number
  })
  @IsOptional()
  @IsNumber()
  videoGenerationStartedAt?: number;

  @ApiPropertyOptional({
    description: 'Timestamp when video generation completed',
    type: Number
  })
  @IsOptional()
  @IsNumber()
  videoGenerationCompletedAt?: number;

  @ApiPropertyOptional({
    description: 'Error message if video generation failed',
    type: String
  })
  @IsOptional()
  @IsString()
  videoGenerationError?: string;

  @ApiPropertyOptional({
    description: 'Whether the recording has a video',
    type: Boolean
  })
  @IsOptional()
  @IsBoolean()
  hasVideo?: boolean;

  @ApiPropertyOptional({
    description: 'Path to the generated video file',
    type: String
  })
  @IsOptional()
  @IsString()
  videoPath?: string;

  @ApiPropertyOptional({
    description: 'Format of the generated video',
    type: String
  })
  @IsOptional()
  @IsString()
  videoFormat?: string;

  @ApiPropertyOptional({
    description: 'Size of the generated video in bytes',
    type: Number
  })
  @IsOptional()
  @IsNumber()
  videoSize?: number;
}

/**
 * Caption data DTO
 */
export class CaptionDataDto {
  @ApiProperty({
    description: 'Timestamp when the caption was created',
    type: Number,
    example: 1651234567890
  })
  @IsNumber()
  timestamp: number;

  @ApiProperty({
    description: 'Conversation object containing the caption text and metadata',
    type: Object
  })
  @IsObject()
  conversation: Conversation;

  @ApiProperty({
    description: 'The index of the frame this caption belongs to',
    type: Number,
    example: 0
  })
  @IsNumber()
  frameIndex: number;
}

/**
 * Video data DTO
 */
export class VideoDataDto {
  @ApiProperty({
    description: 'Array of base64-encoded frames',
    type: [String],
    example: ['data:image/png;base64,iVBORw0KGgo...']
  })
  @IsArray()
  frames: string[];

  @ApiProperty({
    description: 'Array of caption data',
    type: [CaptionDataDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CaptionDataDto)
  captions: CaptionDataDto[];

  @ApiPropertyOptional({
    description: 'Optional recording metadata',
    type: VideoRecordingDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => VideoRecordingDto)
  metadata?: VideoRecordingDto;
}