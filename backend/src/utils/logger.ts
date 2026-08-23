/**
 * Logger Utility
 * Centralized logging for backend
 */

interface LogEntry {
  timestamp: string;
  level: string;
  module: string;
  message: string;
  data?: any;
}

class Logger {
  private module: string;

  constructor(module: string) {
    this.module = module;
  }

  private formatLog(level: string, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      module: this.module,
      message,
      data,
    };
  }

  private output(entry: LogEntry): void {
    const logLevel = process.env.LOG_LEVEL || 'info';
    const levels = ['debug', 'info', 'warn', 'error'];
    
    if (levels.indexOf(entry.level) >= levels.indexOf(logLevel)) {
      console.log(JSON.stringify(entry));
    }
  }

  debug(message: string, data?: any): void {
    this.output(this.formatLog('DEBUG', message, data));
  }

  info(message: string, data?: any): void {
    this.output(this.formatLog('INFO', message, data));
  }

  warn(message: string, data?: any): void {
    this.output(this.formatLog('WARN', message, data));
  }

  error(message: string, data?: any): void {
    this.output(this.formatLog('ERROR', message, data));
  }
}

export default Logger;
