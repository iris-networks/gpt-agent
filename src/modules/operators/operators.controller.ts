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
  @ApiOperation({
    summary: 'Get available operator types',
    description: 'Returns a list of available automation operator types that autonomous agents can use to interact with applications. The system supports both browser-based operators for web automation and computer operators for native desktop application automation, giving agents the flexibility to work across different environments.'
  })
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