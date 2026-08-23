/**
 * Logger utility for Trayon Relayer
 * Provides structured logging with different log levels
 */

import type { Logger } from '../types/index.js';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LOG_COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m', // Cyan
  info: '\x1b[32m', // Green
  warn: '\x1b[33m', // Yellow
  error: '\x1b[31m', // Red
};

const RESET_COLOR = '\x1b[0m';

/**
 * Create a logger instance
 */
export const createLogger = (minLevel: LogLevel = 'info'): Logger => {
  const minLevelNum = LOG_LEVELS[minLevel];
  const isDev = process.env.DEBUG === 'true';

  const formatTimestamp = (): string => {
    return new Date().toISOString();
  };

  const formatMessage = (level: LogLevel, message: string, data?: unknown): string => {
    const timestamp = formatTimestamp();
    const color = isDev ? LOG_COLORS[level] : '';
    const reset = isDev ? RESET_COLOR : '';
    const levelStr = level.toUpperCase().padEnd(5);
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';

    return `${color}[${timestamp}] ${levelStr}${reset} ${message}${dataStr}`;
  };

  return {
    debug: (message: string, data?: unknown) => {
      if (LOG_LEVELS['debug'] >= minLevelNum) {
        console.debug(formatMessage('debug', message, data));
      }
    },

    info: (message: string, data?: unknown) => {
      if (LOG_LEVELS['info'] >= minLevelNum) {
        console.log(formatMessage('info', message, data));
      }
    },

    warn: (message: string, data?: unknown) => {
      if (LOG_LEVELS['warn'] >= minLevelNum) {
        console.warn(formatMessage('warn', message, data));
      }
    },

    error: (message: string, error?: unknown) => {
      if (LOG_LEVELS['error'] >= minLevelNum) {
        const errorStr = error instanceof Error ? error.message : String(error);
        console.error(formatMessage('error', message, errorStr));
      }
    },
  };
};

/**
 * Global logger instance
 */
export const logger = createLogger(
  (process.env.LOG_LEVEL as LogLevel) || 'info'
);
