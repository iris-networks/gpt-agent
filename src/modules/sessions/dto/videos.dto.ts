/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsNumber, IsBoolean, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { VideoGenerationStatus, VideoRecordingDto } from '@app/shared/dto';
import { VideoDataDto } from '@app/shared/dto';

/**
 * DTO for generating a video from a recording.
 * This DTO defines the parameters for customizing video generation.
 */
export class GenerateVideoDto {
  /**
   * Frames per second for the generated video.
   * Controls the playback speed of the video.
   * Higher values make the video play faster.
   * @example 0.2
   * @default 0.2
   * @minimum 0.1
   * @maximum 30
   */
  @ApiPropertyOptional({
    description: 'Frames per second for the generated video (0.2 = 5 seconds per frame)',
    type: Number,
    default: 0.2,
    minimum: 0.1,
    maximum: 30
  })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(30)
  @Type(() => Number)
  fps?: number;

  /**
   * Whether to include captions in the video.
   * When enabled, agent thoughts are displayed as subtitles.
   * @example true
   * @default true
   */
  @ApiPropertyOptional({
    description: 'Whether to include captions in the video',
    type: Boolean,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  captionsEnabled?: boolean;

  /**
   * Video format to generate.
   * - mp4: Best for general use and compatibility
   * - webm: Better compression, works well in browsers
   * - gif: Creates an animated GIF (no audio)
   * @example "mp4"
   * @default "mp4"
   */
  @ApiPropertyOptional({
    description: 'Video format to generate',
    enum: ['mp4', 'webm', 'gif'],
    default: 'mp4'
  })
  @IsOptional()
  @IsEnum(['mp4', 'webm', 'gif'])
  format?: 'mp4' | 'webm' | 'gif';

  /**
   * Video quality level.
   * Affects resolution, bitrate, and file size.
   * @example "medium"
   * @default "medium"
   */
  @ApiPropertyOptional({
    description: 'Video quality level',
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high'])
  quality?: 'low' | 'medium' | 'high';
}

/**
 * Response DTO for video generation
 */
export class GenerateVideoResponseDto {
  @ApiProperty({
    description: 'Whether the video generation was successful',
    type: Boolean,
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Path to the generated video file',
    type: String,
    example: '/Users/user/.iris/videos/12345678-1234-5678-1234-567812345678/video.mp4'
  })
  videoPath: string;

  @ApiProperty({
    description: 'Recording metadata after video generation',
    type: VideoRecordingDto,
    additionalProperties: true
  })
  recording: VideoRecordingDto;
}

/**
 * Response DTO for video status
 */
export class VideoStatusResponseDto {
  @ApiProperty({
    description: 'ID of the recording',
    type: String,
    example: '12345678-1234-5678-1234-567812345678'
  })
  recordingId: string;

  @ApiProperty({
    description: 'Whether the recording has a video file',
    type: Boolean,
    example: true
  })
  hasVideo: boolean;

  @ApiProperty({
    description: 'Status of video generation',
    enum: VideoGenerationStatus,
    example: VideoGenerationStatus.COMPLETED
  })
  status: VideoGenerationStatus;

  @ApiProperty({
    description: 'Human-readable status message',
    type: String,
    example: 'Video generation is complete'
  })
  message: string;

  @ApiPropertyOptional({
    description: 'Timestamp when video generation started (if in progress or completed)',
    type: Number,
    example: 1651234567890
  })
  startedAt?: number;

  @ApiPropertyOptional({
    description: 'Timestamp when video generation completed (if completed)',
    type: Number,
    example: 1651234597890
  })
  completedAt?: number;

  @ApiPropertyOptional({
    description: 'Elapsed time in seconds since generation started (if in progress)',
    type: Number,
    example: 30
  })
  elapsedSeconds?: number;

  @ApiPropertyOptional({
    description: 'Video format (if completed)',
    type: String,
    example: 'mp4'
  })
  format?: string;

  @ApiPropertyOptional({
    description: 'Video size in MB (if completed)',
    type: Number,
    example: 2.5
  })
  sizeMB?: number;

  @ApiPropertyOptional({
    description: 'Error message (if failed)',
    type: String,
    example: 'FFmpeg process exited with code 1'
  })
  error?: string;
}

/**
 * Response DTO for video stream status when in progress
 */
export class VideoStreamInProgressResponseDto {
  @ApiProperty({
    description: 'Status of video generation',
    type: String,
    enum: ['in_progress'],
    example: 'in_progress'
  })
  status: string;

  @ApiProperty({
    description: 'Human-readable status message',
    type: String,
    example: 'Video generation is in progress. Please try again later.'
  })
  message: string;

  @ApiPropertyOptional({
    description: 'Timestamp when video generation started',
    type: Number,
    example: 1651234567890
  })
  startedAt?: number;
}

/**
 * Response DTO for video stream status when failed
 */
export class VideoStreamFailedResponseDto {
  @ApiProperty({
    description: 'Status of video generation',
    type: String,
    enum: ['failed'],
    example: 'failed'
  })
  status: string;

  @ApiProperty({
    description: 'Human-readable status message',
    type: String,
    example: 'Video generation failed.'
  })
  message: string;

  @ApiProperty({
    description: 'Error message',
    type: String,
    example: 'FFmpeg process exited with code 1'
  })
  error: string;
}

/**
 * DTO for listing recordings response
 */
export class RecordingListResponseDto {
  @ApiProperty({
    description: 'List of recordings',
    type: 'array',
    isArray: true
  })
  recordings: VideoRecordingDto[];
}

/**
 * DTO for getting a single recording response
 */
export class RecordingResponseDto {
  @ApiProperty({
    description: 'Whether the request was successful',
    type: Boolean,
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Recording metadata',
    type: VideoRecordingDto,
    additionalProperties: true
  })
  recording: VideoRecordingDto;
}

/**
 * DTO for saving current session as recording response
 */
export class SaveSessionRecordingResponseDto {
  @ApiProperty({
    description: 'Whether the request was successful',
    type: Boolean,
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Recording metadata',
    type: VideoRecordingDto,
    additionalProperties: true
  })
  recording: VideoRecordingDto;
}

/**
 * DTO for current session video data response
 */
export class CurrentSessionVideoDataResponseDto {
  @ApiProperty({
    description: 'Whether the request was successful',
    type: Boolean,
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Video data',
    type: () => VideoDataDto,
    example: {
      frames: ['base64string1', 'base64string2'],
      captions: [
        {
          timestamp: 1651234567890,
          frameIndex: 0,
          conversation: {
            from: 'gpt',
            value: 'Agent thought process here',
            predictionParsed: [{ thought: 'Agent thought process here', action_type: 'click' }]
          }
        }
      ]
    }
  })
  @Type(() => VideoDataDto)
  videoData: VideoDataDto;
}

/**
 * DTO for delete recording response
 */
export class DeleteRecordingResponseDto {
  @ApiProperty({
    description: 'Whether the delete operation was successful',
    type: Boolean,
    example: true
  })
  success: boolean;
}