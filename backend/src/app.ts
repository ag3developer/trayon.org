/**
 * Trayon Backend API
 * Main Express application
 */

import dotenv from 'dotenv';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import Logger from './utils/logger';
import { errorHandler } from './api/middleware/errorHandler';
import { requestLogger } from './api/middleware/requestLogger';

// Load environment variables
dotenv.config();

const logger = new Logger('App');
const app: Express = express();
const PORT = process.env.PORT || 3000;

/**
 * Middleware Setup
 */

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

/**
 * Routes
 */

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/v1/bridge', require('./api/routes/bridge').default);
app.use('/api/v1/validators', require('./api/routes/validators').default);
app.use('/api/v1/tokens', require('./api/routes/tokens').default);
app.use('/api/v1/staking', require('./api/routes/staking').default);
app.use('/api/v1/stats', require('./api/routes/stats').default);

/**
 * Error Handling
 */

app.use(errorHandler);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

/**
 * Start Server
 */

async function startServer() {
  try {
    logger.info('🚀 Starting Trayon Backend API...');

    // Initialize database (when ready)
    logger.info('📊 Database initialization placeholder');

    // Start listening
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`✅ Backend API listening on http://0.0.0.0:${PORT}`);
      logger.info(`📚 API Documentation: http://0.0.0.0:${PORT}/api/docs`);
    });
  } catch (error) {
    logger.error('Failed to start backend server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('🛑 Shutting down backend server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('🛑 Terminating backend server...');
  process.exit(0);
});

// Start server if this is the main module
if (require.main === module) {
  startServer();
}

export default app;
