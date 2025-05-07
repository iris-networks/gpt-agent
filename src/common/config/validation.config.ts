/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { ValidationPipeOptions } from '@nestjs/common';

/**
 * Configuration for NestJS ValidationPipe
 * This configuration ensures proper validation and transformation of DTOs
 * for both API validation and Swagger schema generation
 */
export const validationConfig: ValidationPipeOptions = {
  // Automatically transform payloads to be objects typed according to their DTO classes
  transform: true,
  
  // Transform primitive data types to their correct types based on DTO decorators
  transformOptions: {
    // Enable implicit conversion for primitive types
    enableImplicitConversion: true,
    
    // Expose decorators for Swagger schema generation
    exposeDefaultValues: true,
    
    // Convert empty strings to null
    exposeUnsetFields: false,
    
    // Preserve default value decorators
    enableCircularCheck: true,
  },
  
  // Only use properties defined in DTOs
  whitelist: true,
  
  // Throw errors if properties not defined in DTO are present
  forbidNonWhitelisted: true,
  
  // Throw errors if unknown enums are passed
  forbidUnknownValues: true,
  
  // Use validator's 'skipMissingProperties' option to skip validation of missing properties 
  skipMissingProperties: false,
  
  // Skip validating null properties (setting to false to avoid null properties)
  skipNullProperties: false,
  
  // Skip validating undefined properties
  skipUndefinedProperties: false,
  
  // Don't validate empty strings as valid by default
  dismissDefaultMessages: false,
  
  // Validate custom decorators
  validateCustomDecorators: true,
  
  // Stop validation at first error per property
  stopAtFirstError: true,
  
  // Return plain errors rather than ValidationErrors
  exceptionFactory: undefined,
};