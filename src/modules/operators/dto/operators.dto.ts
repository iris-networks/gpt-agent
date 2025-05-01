/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { ApiProperty } from '@nestjs/swagger';
import { OperatorType } from '../../../shared/constants';

export class OperatorTypesDto {
  @ApiProperty({
    description: 'List of available operator types',
    enum: OperatorType,
    isArray: true,
  })
  types: OperatorType[];
}