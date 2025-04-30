/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './modules/config/config.service';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggerService } from './common/services/logger.service';
import * as express from 'express';
import * as cors from 'cors';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      logger: new LoggerService(),
    });

    // Configure global prefix for API routes
    app.setGlobalPrefix('api');

    // Enable CORS
    app.use(cors());

    // Configure JSON body parser with size limits
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // Enable validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    // Setup Swagger documentation
    const config = new DocumentBuilder()
      .setTitle('Zenobia API')
      .setDescription('Zenobia project API')
      .setVersion('0.1.0')
      .addTag('sessions', 'Session management')
      .addTag('operators', 'Operator management')
      .addTag('config', 'Configuration management')
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    
    // Add endpoint to download OpenAPI JSON spec
    app.use('/api/docs/openapi.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=openapi.json');
      res.send(document);
    });
    
    SwaggerModule.setup('api/docs', app, document);

    // Get configuration service
    const configService = app.get(ConfigService);
    const PORT = configService.getPort();
    const HOST = configService.getHost();

    // Start server
    await app.listen(PORT, HOST);
    console.log(`Zenobia API Server running at http://${HOST}:${PORT}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();