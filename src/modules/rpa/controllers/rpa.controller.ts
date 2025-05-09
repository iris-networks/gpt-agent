/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiParam,
} from '@nestjs/swagger';
import { RpaService } from '../services/rpa.service';
import {
  StartRpaExecutionDto,
  RpaExecutionStatusDto,
} from '../dto/rpa.dto';

@ApiTags('rpa')
@Controller('rpa')
export class RpaController {
  private readonly logger = new Logger(RpaController.name);

  constructor(private readonly rpaService: RpaService) {}

  /**
   * Start RPA execution from a recording
   */
  @Post('execute')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Start RPA execution from a recording',
    description: 'Initiates an automated execution of actions captured in a recording.'
  })
  @ApiCreatedResponse({
    description: 'RPA execution started successfully',
    type: RpaExecutionStatusDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request or recording not found'
  })
  async startExecution(
    @Body() startRpaDto: StartRpaExecutionDto
  ): Promise<RpaExecutionStatusDto> {
    this.logger.log(`Starting RPA execution from recording ${startRpaDto.recordingId}`);
    return this.rpaService.startExecution(startRpaDto);
  }

  /**
   * Stop an ongoing RPA execution
   */
  @Post(':executionId/stop')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Stop an ongoing RPA execution',
    description: 'Stops a running RPA execution and releases resources.'
  })
  @ApiParam({
    name: 'executionId',
    description: 'ID of the RPA execution to stop',
    example: 'rpa_1695872345678'
  })
  @ApiOkResponse({
    description: 'RPA execution stopped successfully',
    type: RpaExecutionStatusDto,
  })
  @ApiNotFoundResponse({
    description: 'RPA execution not found'
  })
  async stopExecution(
    @Param('executionId') executionId: string
  ): Promise<RpaExecutionStatusDto> {
    this.logger.log(`Stopping RPA execution ${executionId}`);
    return this.rpaService.stopExecution(executionId);
  }

  /**
   * Get status of an RPA execution
   */
  @Get(':executionId/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get status of an RPA execution',
    description: 'Returns the current status and progress of an RPA execution.'
  })
  @ApiParam({
    name: 'executionId',
    description: 'ID of the RPA execution to get status for',
    example: 'rpa_1695872345678'
  })
  @ApiOkResponse({
    description: 'RPA execution status retrieved successfully',
    type: RpaExecutionStatusDto,
  })
  @ApiNotFoundResponse({
    description: 'RPA execution not found'
  })
  getExecutionStatus(
    @Param('executionId') executionId: string
  ): RpaExecutionStatusDto {
    return this.rpaService.getExecutionStatus(executionId);
  }
}