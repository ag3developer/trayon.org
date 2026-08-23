/**
 * Request Logger Middleware
 */

import { Request, Response, NextFunction } from 'express';
import Logger from '../../utils/logger';

const logger = new Logger('HTTP');

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });

  next();
}
