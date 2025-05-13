/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsObject, IsArray, IsString, IsOptional, IsBoolean, ValidateNested, IsEnum } from 'class-validator';
import { Conversation, PredictionParsed } from '@ui-tars/shared/types';
import { SessionStatus, OperatorType } from './constants';
import { ReactAgent } from '@app/agents/reAct';
import { Operator } from '@app/packages/ui-tars-sdk';

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
 * System configuration DTO
 */
export class IrisConfigDto {
  @ApiProperty({
    description: 'Base URL for the vision language model API',
    type: String
  })
  @IsString()
  vlmBaseUrl: string;

  @ApiProperty({
    description: 'API key for the vision language model',
    type: String
  })
  @IsString()
  vlmApiKey: string;

  @ApiProperty({
    description: 'Model name for the vision language model',
    type: String
  })
  @IsString()
  vlmModelName: string;

  @ApiProperty({
    description: 'Provider of the vision language model',
    type: String
  })
  @IsString()
  vlmProvider: string;

  @ApiProperty({
    description: 'Language setting for the application',
    type: String
  })
  @IsString()
  language: string;

  @ApiProperty({
    description: 'Default operator type to use',
    enum: OperatorType
  })
  @IsEnum(OperatorType)
  defaultOperator: OperatorType;

  @ApiProperty({
    description: 'Maximum number of loop iterations',
    type: Number
  })
  @IsNumber()
  maxLoopCount: number;

  @ApiProperty({
    description: 'Interval between loop iterations in milliseconds',
    type: Number
  })
  @IsNumber()
  loopIntervalInMs: number;
}

/**
 * Session creation request DTO
 */
export class CreateSessionRequestDto {
  @ApiProperty({
    description: 'Instructions for the session',
    type: String
  })
  @IsString()
  instructions: string;

  @ApiPropertyOptional({
    description: 'Operator type to use for the session',
    enum: OperatorType
  })
  @IsOptional()
  @IsEnum(OperatorType)
  operator?: OperatorType;

  @ApiPropertyOptional({
    description: 'Custom configuration options',
    type: IrisConfigDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => IrisConfigDto)
  config?: Partial<IrisConfigDto>;

  // AbortController is excluded from DTO as it's not serializable
}

/**
 * Message DTO
 */
export class MessageDto {
  @ApiProperty({
    description: 'Role of the message sender',
    enum: ['user', 'assistant', 'system']
  })
  @IsString()
  role: 'user' | 'assistant' | 'system';

  @ApiProperty({
    description: 'Content of the message',
    type: String
  })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    description: 'Timestamp when the message was created',
    type: Number
  })
  @IsOptional()
  @IsNumber()
  timestamp?: number;
}

/**
 * Session response DTO
 */
export class SessionResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the session',
    type: String
  })
  @IsString()
  sessionId: string;

  @ApiProperty({
    description: 'Current status of the session',
    enum: SessionStatus
  })
  @IsEnum(SessionStatus)
  status: SessionStatus;

  @ApiProperty({
    description: 'Operator type used for the session',
    enum: OperatorType
  })
  @IsEnum(OperatorType)
  operator: OperatorType;

  @ApiPropertyOptional({
    description: 'Conversation history',
    type: [MessageDto]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  conversations?: MessageDto[];

  @ApiPropertyOptional({
    description: 'Error message if there was an issue',
    type: String
  })
  @IsOptional()
  @IsString()
  errorMsg?: string;
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
 * Timestamps DTO
 */
export class TimestampsDto {
  @ApiProperty({
    description: 'Timestamp when the item was created',
    type: Number
  })
  @IsNumber()
  created: number;

  @ApiProperty({
    description: 'Timestamp when the item was last updated',
    type: Number
  })
  @IsNumber()
  updated: number;

  @ApiPropertyOptional({
    description: 'Timestamp when the item was completed',
    type: Number
  })
  @IsOptional()
  @IsNumber()
  completed?: number;
}

/**
 * Session data DTO
 */
export class SessionDataDto {
  @ApiProperty({
    description: 'Unique identifier for the session',
    type: String
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Agent instance',
    type: Object
  })
  @IsObject()
  agent: ReactAgent;

  @ApiProperty({
    description: 'Operator instance',
    type: Object
  })
  @IsObject()
  operator: Operator;

  @ApiProperty({
    description: 'Conversation history',
    type: [MessageDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  conversations: MessageDto[];

  @ApiProperty({
    description: 'Current status of the session',
    enum: SessionStatus
  })
  @IsEnum(SessionStatus)
  status: SessionStatus;

  @ApiProperty({
    description: 'Instructions for the session',
    type: String
  })
  @IsString()
  instructions: string;

  @ApiProperty({
    description: 'Operator type used for the session',
    enum: OperatorType
  })
  @IsEnum(OperatorType)
  operatorType: OperatorType;

  @ApiPropertyOptional({
    description: 'Error message if there was an issue',
    type: String
  })
  @IsOptional()
  @IsString()
  errorMsg?: string;

  @ApiProperty({
    description: 'Timestamps for the session',
    type: TimestampsDto
  })
  @ValidateNested()
  @Type(() => TimestampsDto)
  timestamps: TimestampsDto;
}

/**
 * Screenshot response DTO
 */
export class ScreenshotResponseDto {
  @ApiProperty({
    description: 'Whether the operation was successful',
    type: Boolean
  })
  @IsBoolean()
  success: boolean;

  @ApiPropertyOptional({
    description: 'Base64 encoded screenshot image',
    type: String
  })
  @IsOptional()
  @IsString()
  screenshot?: string;

  @ApiPropertyOptional({
    description: 'Error message if there was an issue',
    type: String
  })
  @IsOptional()
  @IsString()
  error?: string;
}

/**
 * Configuration update request DTO
 */
export class ConfigUpdateRequestDto {
  @ApiProperty({
    description: 'Configuration options to update',
    type: IrisConfigDto
  })
  @ValidateNested()
  @Type(() => IrisConfigDto)
  config: Partial<IrisConfigDto>;
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
 * Processed caption DTO for display and video generation
 */
export class ProcessedCaptionDto {
  @ApiProperty({
    description: 'Caption text (thought)',
    type: String,
    example: 'I need to click on the Submit button'
  })
  @IsString()
  text: string;

  @ApiProperty({
    description: 'Action performed (e.g., click, type, hotkey)',
    type: String,
    example: 'click'
  })
  @IsString()
  action: string;

  @ApiProperty({
    description: 'Details of the action (e.g., what was typed, where clicked)',
    type: String,
    example: 'Clicked on Submit button'
  })
  @IsString()
  details: string;

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

/**
 * Action details DTO
 */
export class ActionDetailsDto {
  @ApiProperty({
    description: 'The action type (click, type, hotkey, etc.)',
    type: String
  })
  @IsString()
  action: string;

  @ApiPropertyOptional({
    description: 'Optional selectors for the action',
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  selectors?: string[];

  @ApiPropertyOptional({
    description: 'Action parameters',
    type: Object
  })
  @IsOptional()
  @IsObject()
  params?: any;
}