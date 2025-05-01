/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { SessionManagerService } from './services/session-manager.service';
import {
  CreateSessionDto,
  SessionResponseDto,
  CreateSessionResponseDto,
  CancelSessionResponseDto,
  ScreenshotResponseDto,
} from './dto/sessions.dto';
import { apiLogger } from '../../common/services/logger.service';

@ApiTags('sessions')
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionManagerService: SessionManagerService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new session' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The session has been successfully created',
    type: CreateSessionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async createSession(
    @Body() createSessionDto: CreateSessionDto,
  ): Promise<CreateSessionResponseDto> {
    try {
      const sessionId = await this.sessionManagerService.createSession(createSessionDto);
      apiLogger.info(`Session created: ${sessionId}`);
      return { sessionId };
    } catch (error: any) {
      apiLogger.error('Failed to create session:', error);

      if (error.message.includes('Instructions are required')) {
        throw new BadRequestException('Instructions are required');
      }

      throw new InternalServerErrorException(
        error.message || 'Failed to create session',
      );
    }
  }

  @Get(':sessionId')
  @ApiOperation({ summary: 'Get session status' })
  @ApiParam({ name: 'sessionId', description: 'The session ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Session information retrieved successfully',
    type: SessionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Session not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  getSession(@Param('sessionId') sessionId: string): SessionResponseDto {
    try {
      if (!sessionId) {
        throw new BadRequestException('Session ID is required');
      }

      const session = this.sessionManagerService.getSession(sessionId);
      return session;
    } catch (error: any) {
      apiLogger.error(`Failed to get session: ${sessionId}`, error);

      if (error.message === 'Session not found') {
        throw new NotFoundException('Session not found');
      }

      throw new InternalServerErrorException(
        error.message || 'Failed to get session',
      );
    }
  }

  @Post(':sessionId/cancel')
  @ApiOperation({ summary: 'Cancel a session' })
  @ApiParam({ name: 'sessionId', description: 'The session ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Session cancelled successfully',
    type: CancelSessionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Session not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  cancelSession(
    @Param('sessionId') sessionId: string,
  ): CancelSessionResponseDto {
    try {
      if (!sessionId) {
        throw new BadRequestException('Session ID is required');
      }

      const result = this.sessionManagerService.cancelSession(sessionId);
      apiLogger.info(`Session cancelled: ${sessionId}`);
      return { success: result };
    } catch (error: any) {
      apiLogger.error(`Failed to cancel session: ${sessionId}`, error);

      if (error.message === 'Session not found') {
        throw new NotFoundException('Session not found');
      }

      throw new InternalServerErrorException(
        error.message || 'Failed to cancel session',
      );
    }
  }

  @Get(':sessionId/screenshot')
  @ApiOperation({ summary: 'Take a screenshot' })
  @ApiParam({ name: 'sessionId', description: 'The session ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Screenshot taken successfully',
    type: ScreenshotResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Session not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async takeScreenshot(
    @Param('sessionId') sessionId: string,
  ): Promise<ScreenshotResponseDto> {
    try {
      if (!sessionId) {
        throw new BadRequestException('Session ID is required');
      }

      const screenshot = await this.sessionManagerService.takeScreenshot(
        sessionId,
      );
      return {
        success: true,
        screenshot,
      };
    } catch (error: any) {
      apiLogger.error(
        `Failed to take screenshot for session: ${sessionId}`,
        error,
      );

      if (error.message === 'Session not found') {
        throw new NotFoundException('Session not found');
      }

      return {
        success: false,
        error: error.message || 'Failed to take screenshot',
      };
    }
  }
}