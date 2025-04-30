/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../services/logger.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new LoggerService();

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : exception instanceof Error
        ? exception.message
        : 'Internal server error';

    this.logger.error(
      `Exception: ${message}`,
      exception instanceof Error ? exception.stack : undefined,
      'GlobalExceptionFilter',
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error:
        process.env.NODE_ENV === 'production' && status === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Internal server error'
          : message,
    });
  }
}