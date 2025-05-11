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
  BatchExecuteRpaDto,
  ParameterTemplateResponseDto,
  SimpleSuccessResponseDto
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
  
  /**
   * Get parameter template for a recording
   */
  @Get(':recordingId/parameter-template')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get parameter template for a recording',
    description: 'Returns a template with all parameterizable fields in a recording.'
  })
  @ApiParam({
    name: 'recordingId',
    description: 'ID of the recording to get parameter template for',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6'
  })
  @ApiOkResponse({
    description: 'Parameter template retrieved successfully',
    type: ParameterTemplateResponseDto
  })
  @ApiBadRequestResponse({
    description: 'Recording not found or no type actions in recording'
  })
  async getParameterTemplate(
    @Param('recordingId') recordingId: string
  ): Promise<ParameterTemplateResponseDto> {
    this.logger.log(`Getting parameter template for recording ${recordingId}`);
    return this.rpaService.getParameterTemplate(recordingId);
  }
  
  /**
   * Execute RPA with multiple parameter sets
   */
  @Post('batch-execute')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Execute RPA with multiple parameter sets',
    description: 'Starts multiple RPA executions with different parameter values.'
  })
  @ApiCreatedResponse({
    description: 'Batch execution started successfully',
    type: SimpleSuccessResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request or recording not found'
  })
  async batchExecute(
    @Body() batchDto: BatchExecuteRpaDto
  ): Promise<SimpleSuccessResponseDto> {
    this.logger.log(`Starting batch execution for recording ${batchDto.recordingId} with ${batchDto.parameterSets.length} parameter sets`);
    
    const executionIds = await this.rpaService.batchExecute(batchDto);
    
    return {
      success: true,
      message: `Started ${executionIds.length} executions: ${executionIds.join(', ')}`
    };
  }
}