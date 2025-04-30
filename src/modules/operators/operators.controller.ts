/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OperatorFactoryService } from './services/operator-factory.service';
import { OperatorType } from '../../shared/constants';
import { OperatorTypesDto } from './dto/operators.dto';

@ApiTags('operators')
@Controller('operators')
export class OperatorsController {
  constructor(private readonly operatorFactoryService: OperatorFactoryService) {}

  @Get('types')
  @ApiOperation({ summary: 'Get available operator types' })
  @ApiResponse({
    status: 200,
    description: 'List of available operator types',
    type: OperatorTypesDto,
  })
  getOperatorTypes(): OperatorTypesDto {
    return {
      types: Object.values(OperatorType),
    };
  }
}