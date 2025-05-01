/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { Controller, Get, Put, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from './config.service';
import { ConfigResponseDto, UpdateConfigDto } from './dto/config.dto';
import { apiLogger } from '../../common/services/logger.service';

@ApiTags('config')
@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Get current configuration' })
  @ApiResponse({
    status: 200,
    description: 'Current configuration',
    type: ConfigResponseDto,
  })
  getConfig(): ConfigResponseDto {
    apiLogger.info('Fetching configuration');
    return this.configService.getConfig();
  }

  @Put()
  @ApiOperation({ summary: 'Update configuration' })
  @ApiResponse({
    status: 200,
    description: 'Configuration after update',
    type: ConfigResponseDto,
  })
  updateConfig(@Body() updateConfigDto: UpdateConfigDto): ConfigResponseDto {
    apiLogger.info('Updating configuration');
    return this.configService.updateConfig(updateConfigDto);
  }
}