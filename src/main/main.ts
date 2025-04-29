/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { ConfigService } from './services/config';
import { SessionManager } from './services/session-manager';
import routes from './routes';
import { mainLogger } from './utils/logger';

/**
 * Initialize the Iris API server
 */
async function bootstrap() {
  try {
    const configService = ConfigService.getInstance();
    const app = express();

    // Middleware
    app.use(cors());
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    app.use(express.static(path.join(__dirname, '../public')));

    // Request logging middleware
    app.use((req, res, next) => {
      mainLogger.info(`${req.method} ${req.url}`);
      next();
    });

    // Mount routes - both API and UI routes
    app.use(routes);

    // Root route - health check
    app.get('/', (req, res) => {
      res.json({
        status: 'ok',
        service: 'Iris API',
        version: '0.1.0',
      });
    });

    // Error handler
    app.use(
      (
        err: Error,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
      ) => {
        mainLogger.error('Unhandled error:', err);
        res.status(500).json({
          error: 'Internal server error',
          message:
            process.env.NODE_ENV === 'production' ? undefined : err.message,
        });
      },
    );

    // Start the server
    const PORT = configService.getPort();
    const HOST = configService.getHost();

    app.listen(PORT, HOST, () => {
      mainLogger.info(`Iris API Server running at http://${HOST}:${PORT}`);
    });

    // Set up session cleanup interval
    setInterval(
      () => {
        SessionManager.getInstance().cleanupSessions();
      },
      15 * 60 * 1000,
    ); // Clean up every 15 minutes
  } catch (error) {
    mainLogger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
bootstrap();
