import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum } from 'class-validator';

/**
 * Human layer request status enum
 */
export enum HumanLayerStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  TIMED_OUT = 'timed_out'
}

/**
 * Human layer request DTO
 */
export class HumanLayerRequestDto {
  @ApiProperty({
    description: 'Unique ID of the request',
    type: String
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Title of the request',
    type: String
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Reason for the human layer intervention',
    type: String
  })
  @IsString()
  reason: string;

  @ApiProperty({
    description: 'Status of the request',
    enum: HumanLayerStatus
  })
  @IsEnum(HumanLayerStatus)
  status: HumanLayerStatus;

  @ApiProperty({
    description: 'Timestamp when the request was created',
    type: Number
  })
  @IsNumber()
  timestamp: number;

  @ApiProperty({
    description: 'Timestamp when the request will timeout',
    type: Number
  })
  @IsNumber()
  timeoutAt: number;
}

/**
 * Approve request response DTO
 */
export class ApproveRequestResponseDto {
  @ApiProperty({
    description: 'Whether the request was successfully approved',
    type: Boolean
  })
  success: boolean;

  @ApiPropertyOptional({
    description: 'Optional message about the result',
    type: String
  })
  message?: string;
}