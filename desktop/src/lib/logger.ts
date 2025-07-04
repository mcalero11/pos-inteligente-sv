import { trace, debug, info, warn, error as logError } from '@tauri-apps/plugin-log';

export enum LogLevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export class Logger {
  private static instance: Logger;
  private context: string;

  private constructor(context: string = 'App') {
    this.context = context;
  }

  static getInstance(context?: string): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(context);
    }
    return Logger.instance;
  }

  static createLogger(context: string): Logger {
    return new Logger(context);
  }

  private formatMessage(message: string, level: LogLevel): string {
    const timestamp = new Date().toISOString().replace('T', ' ').replace('Z', '');
    return `[${timestamp}] [${level.toUpperCase()}] [${this.context}] ${message}`;
  }

  private formatData(data: any): string {
    if (data === null || data === undefined) {
      return '';
    }

    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  }

  async trace(message: string, data?: any): Promise<void> {
    const formattedData = data ? `\n${this.formatData(data)}` : '';
    const logMessage = `${this.formatMessage(message, LogLevel.TRACE)}${formattedData}`;
    await trace(logMessage);
  }

  async debug(message: string, data?: any): Promise<void> {
    const formattedData = data ? `\n${this.formatData(data)}` : '';
    const logMessage = `${this.formatMessage(message, LogLevel.DEBUG)}${formattedData}`;
    await debug(logMessage);
  }

  async info(message: string, data?: any): Promise<void> {
    const formattedData = data ? `\n${this.formatData(data)}` : '';
    const logMessage = `${this.formatMessage(message, LogLevel.INFO)}${formattedData}`;
    await info(logMessage);
  }

  async warn(message: string, data?: any): Promise<void> {
    const formattedData = data ? `\n${this.formatData(data)}` : '';
    const logMessage = `${this.formatMessage(message, LogLevel.WARN)}${formattedData}`;
    await warn(logMessage);
  }

  async error(message: string, error?: Error | any): Promise<void> {
    let logMessage = this.formatMessage(message, LogLevel.ERROR);

    if (error) {
      if (error instanceof Error) {
        logMessage += ` Error: ${error.message}\nStack: ${error.stack}`;
      } else {
        logMessage += ` ${JSON.stringify(error)}`;
      }
    }

    await logError(logMessage);
  }

  // Convenience methods for common use cases
  async logUserAction(action: string, details?: any): Promise<void> {
    await this.info(`User Action: ${action}`, details);
  }

  async logApiCall(endpoint: string, method: string, duration?: number): Promise<void> {
    const message = `API Call: ${method} ${endpoint}`;
    const data = duration ? { duration_ms: duration } : undefined;
    await this.info(message, data);
  }

  async logError(operation: string, error: Error): Promise<void> {
    await this.error(`Failed: ${operation}`, error);
  }

  async logPerformance(operation: string, duration: number): Promise<void> {
    await this.info(`Performance: ${operation}`, { duration_ms: duration });
  }
}

// Default logger instance
export const logger = Logger.getInstance();

// Specialized loggers for different parts of the app
export const posLogger = Logger.createLogger('POS');
export const authLogger = Logger.createLogger('Auth');
export const dteLogger = Logger.createLogger('DTE');
export const storageLogger = Logger.createLogger('Storage'); 
