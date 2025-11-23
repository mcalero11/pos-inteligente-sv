import { info, warn, error as logError, debug, trace } from '@tauri-apps/plugin-log';

export enum LogLevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * Logger - Centralized logging facade
 *
 * Wraps Tauri's logging plugin with a consistent interface.
 * All log messages are forwarded to both console (dev) and Tauri log files.
 */
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

  private formatData(data: unknown): string {
    if (data === null || data === undefined) {
      return '';
    }

    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  }

  async trace(message: string, data?: unknown): Promise<void> {
    const formattedData = data ? `\n${this.formatData(data)}` : '';
    const logMessage = `${this.formatMessage(message, LogLevel.TRACE)}${formattedData}`;
    await trace(logMessage);
    if (import.meta.env.DEV) {
      console.trace(`[TRACE] ${logMessage}`);
    }
  }

  async debug(message: string, data?: unknown): Promise<void> {
    const formattedData = data ? `\n${this.formatData(data)}` : '';
    const logMessage = `${this.formatMessage(message, LogLevel.DEBUG)}${formattedData}`;
    await debug(logMessage);
    if (import.meta.env.DEV) {
      console.debug(`[DEBUG] ${logMessage}`);
    }
  }

  async info(message: string, data?: unknown): Promise<void> {
    const formattedData = data ? `\n${this.formatData(data)}` : '';
    const logMessage = `${this.formatMessage(message, LogLevel.INFO)}${formattedData}`;
    await info(logMessage);
    if (import.meta.env.DEV) {
      console.info(`[INFO] ${logMessage}`);
    }
  }

  async warn(message: string, data?: unknown): Promise<void> {
    const formattedData = data ? `\n${this.formatData(data)}` : '';
    const logMessage = `${this.formatMessage(message, LogLevel.WARN)}${formattedData}`;
    await warn(logMessage);
    console.warn(`[WARN] ${logMessage}`);
  }

  async error(message: string, error?: Error | unknown): Promise<void> {
    let logMessage = this.formatMessage(message, LogLevel.ERROR);

    if (error) {
      if (error instanceof Error) {
        logMessage += ` Error: ${error.message}\nStack: ${error.stack}`;
      } else {
        logMessage += ` ${JSON.stringify(error)}`;
      }
    }

    await logError(logMessage);
    console.error(`[ERROR] ${logMessage}`);
  }

  // Convenience methods
  async logUserAction(action: string, details?: unknown): Promise<void> {
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
