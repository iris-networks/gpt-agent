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
      .setTitle('Iris Intelligent Automation Platform API')
      .setDescription(`
Iris is an intelligent automation platform that learns from demonstrations and transforms them into robust workflows.

## Key Features
- **Demonstration-Based Learning**: Create automation by showing how tasks are performed
- **Video Analysis**: Convert screen recordings into precise automation instructions
- **Task Recording & Replay**: Record workflows and replay them with the same or different parameters
- **RPA Process Generation**: Automatically convert recordings into parameterized workflows
- **Action Caching**: Efficiently reuse automation steps across different tasks
- **Multi-operator Support**: Control browsers or native desktop applications

The API enables developers to create automation that can handle complex real-world tasks through a combination of visual analysis, session recording, and parameterized execution.
      `)
      .setVersion('0.1.0')
      .addServer(`http://${process.env.HOST || '0.0.0.0'}:${process.env.PORT || 3000}`, 'Local development server')
      .addTag('sessions', 'Real-time session management for automation')
      .addTag('operators', 'Control browser and desktop automation interfaces')
      .addTag('config', 'System-wide configuration for automation and RPA processes')
      .addTag('videos', 'Session recording, playback and workflow generation')
      .addTag('rpa', 'Execute and parameterize recorded actions as reusable workflows')
      .addTag('video', 'Learning from video recordings to generate automation steps')
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
        title: 'Iris Intelligent Automation Platform API',
        description: `
          Iris is an intelligent browser automation platform that combines AI-powered agents with
          Robotic Process Automation (RPA) capabilities, enabling developers to create, manage and
          deploy autonomous agents while providing comprehensive tools for recording, analyzing,
          and converting tasks into reusable RPA processes.
        `,
        theme: 'purple',
        // Re-add custom assets
        logo: '/assets/iris-logo.svg',
        favicon: '/assets/iris-favicon.svg',
        // Specify server URL
        server: {
          url: `http://${process.env.HOST || '0.0.0.0'}:${process.env.PORT || 3000}/api`,
          description: 'Local development server'
        },
        // Enhanced collections with clear descriptions focused on autonomous agents and RPA
        collections: [
          {
            name: 'Sessions & Recordings',
            description: 'Manage automation sessions and create reusable process recordings',
            tags: ['sessions', 'videos']
          },
          {
            name: 'Automation Operators',
            description: 'Control how the system interacts with browser and desktop interfaces',
            tags: ['operators']
          },
          {
            name: 'RPA Workflows',
            description: 'Create parameterized automation processes from recordings and execute them at scale',
            tags: ['rpa', 'video']
          },
          {
            name: 'Learning from Video',
            description: 'Extract automation workflows from video recordings through visual analysis',
            tags: ['video']
          },
          {
            name: 'System Configuration',
            description: 'Configure system behavior, model settings, and runtime parameters',
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
    console.log(`Iris API Server running at http://${HOST}:${PORT}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();