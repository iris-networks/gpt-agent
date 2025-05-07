/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './modules/config/config.service';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggerService } from './common/services/logger.service';
import { validationConfig } from './common/config/validation.config';
import { collectDtoModels, getSwaggerModels } from './common/utils/swagger.utils';
import * as express from 'express';
import * as cors from 'cors';
import { apiReference } from '@scalar/nestjs-api-reference';

// Import all DTOs for Swagger documentation
import * as sessionDtos from './modules/sessions/dto';

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

    // Enable validation pipe with enhanced configuration for DTOs and Swagger
    app.useGlobalPipes(new ValidationPipe(validationConfig));

    // Serve static files from the assets directory
    app.use('/assets', express.static('src/public/assets'));
    
    // Setup Swagger documentation
    const config = new DocumentBuilder()
      .setTitle('Zenobia API')
      .setDescription('Zenobia project API')
      .setVersion('0.1.0')
      .addServer(`http://${process.env.HOST || '0.0.0.0'}:${process.env.PORT || 3000}/api`, 'Local development server')
      .addTag('sessions', 'Session management')
      .addTag('operators', 'Operator management')
      .addTag('config', 'Configuration management')
      .addTag('videos', 'Video recording and playback')
      .build();
    
    // Collect all DTO models for Swagger
    const allDtoModels = [
      ...collectDtoModels(sessionDtos),
      // Add other module DTOs here as needed
    ];
    
    // Create Swagger document with enhanced options for schema inference
    const document = SwaggerModule.createDocument(app, config, {
      deepScanRoutes: true,
      extraModels: allDtoModels,
      ignoreGlobalPrefix: false,
      operationIdFactory: (
        controllerKey: string,
        methodKey: string
      ) => methodKey
    });
    
    // Add endpoint to download OpenAPI JSON spec
    app.use('/api/docs/openapi.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=openapi.json');
      res.send(document);
    });
    
    // Set up Scalar API Reference (beautiful API docs)
    app.use(
      '/api/reference',
      apiReference({
        // Point to the JSON URL instead of passing the spec directly
        url: '/api/docs/openapi.json',
        // Configuration options
        title: 'Zenobia API',
        description: 'Zenobia project API documentation',
        theme: 'purple',
        // Re-add custom assets
        logo: '/assets/zenobia-logo.svg',
        favicon: '/assets/zenobia-favicon.svg',
        // Specify server URL
        server: {
          url: `http://${process.env.HOST || '0.0.0.0'}:${process.env.PORT || 3000}/api`,
          description: 'Local development server'
        },
        // Simplified collections
        collections: [
          {
            name: 'Sessions',
            tags: ['sessions', 'videos']
          },
          {
            name: 'Operators',
            tags: ['operators']
          },
          {
            name: 'Configuration',
            tags: ['config']
          }
        ],
        // Default light/dark mode theme
        darkMode: true,
        // Code examples
        codeExamples: {
          languages: ['curl', 'typescript', 'python'],
          defaultLanguage: 'typescript',
        }
      })
    );
    
    // Keep the original Swagger UI as well
    SwaggerModule.setup('api/docs', app, document, {
      explorer: true,
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        deepLinking: true,
        displayOperationId: false,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      }
    });

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