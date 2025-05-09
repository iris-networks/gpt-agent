/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VideoUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Video file to analyze (MP4, WebM, or AVI)',
  })
  file: any;
}

export class VideoAnalysisResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the analysis',
    example: '1682598432741',
  })
  analysisId: string;

  @ApiProperty({
    description: 'Original uploaded video filename',
    example: 'recording-1682598432741.mp4',
  })
  originalVideo: string;

  @ApiProperty({
    description: 'Processed video filename with idle sections removed',
    example: 'processed-recording-1682598432741.mp4',
  })
  processedVideo: string;

  @ApiProperty({
    description: 'Status message',
    example: 'Video uploaded and analyzed successfully',
  })
  message: string;
}

export class RpaStepsDto {
  @ApiProperty({
    description: 'Unique identifier for the analysis',
    example: '1682598432741',
  })
  analysisId: string;

  @ApiProperty({
    description: 'Generated RPA steps for browser automation',
    example: `1. Move mouse to position (125, 50)
2. Click left mouse button
3. Type "example.com"
4. Press ENTER key
5. Wait 2 seconds
6. Move mouse to position (250, 150)
7. Click left mouse button`,
  })
  rpaSteps: string;

  @ApiProperty({
    description: 'URL to access the processed video',
    example: '/api/video/processed/processed-recording-1682598432741.mp4',
  })
  processedVideoUrl: string;

  @ApiProperty({
    description: 'URL to access the original video',
    example: '/api/video/original/recording-1682598432741.mp4',
  })
  originalVideoUrl: string;
}

export class ExecuteRpaDto {
  @ApiProperty({
    description: 'Session ID to execute the RPA steps in',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsNotEmpty()
  @IsString()
  sessionId: string;
}