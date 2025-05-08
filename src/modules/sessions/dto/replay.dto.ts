/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { ApiProperty } from '@nestjs/swagger';
import { VideoData } from '@app/shared/types';

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
    type: Object,
    additionalProperties: true
  })
  replayData: VideoData;
}