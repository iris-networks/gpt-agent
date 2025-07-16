/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CaptionDataDto, VideoDataDto } from './sessions-dto';

/**
 * DTO for session replay data response
 */
export class SessionReplayDataResponseDto {
  @ApiProperty({
    description: 'Whether the request was successful',
    type: Boolean,
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Replay video data',
    type: VideoDataDto
  })
  @Type(() => VideoDataDto)
  replayData: VideoDataDto;
}