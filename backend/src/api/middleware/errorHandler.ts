/**
 * Error Handler Middleware
 */

import { Request, Response, NextFunction } from 'express';
import Logger from '../../utils/logger';

const logger = new Logger('ErrorHandler');

interface ApiError extends Error {
  status?: number;
  code?: string;
}

export function errorHandler(
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error('Request error', {
    path: req.path,
    method: req.method,
    error: err.message,
    stack: err.stack,
  });

  const status = err.status || 500;
  const code = err.code || 'INTERNAL_ERROR';

  res.status(status).json({
    error: {
      code,
      message: err.message || 'Internal Server Error',
    },
  });
}
