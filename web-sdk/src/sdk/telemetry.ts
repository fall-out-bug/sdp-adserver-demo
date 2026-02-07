/**
 * Telemetry - Logging and error tracking for SDK
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
}

export interface LogEntry {
  level: LogLevel;
  timestamp: number;
  message: string;
  context?: Record<string, unknown>;
  error?: Error;
}

export interface LoggerConfig {
  level?: LogLevel;
  prefix?: string;
  enableConsole?: boolean;
  maxEntries?: number;
}

/**
 * Logger class for structured logging
 */
export class Logger {
  private _level: LogLevel;
  private _prefix: string;
  private _enableConsole: boolean;
  private _entries: LogEntry[];
  private _maxEntries: number;

  constructor(config: LoggerConfig = {}) {
    this._level = config.level ?? LogLevel.WARN;
    this._prefix = config.prefix ?? '[AdServerSDK]';
    this._enableConsole = config.enableConsole ?? true;
    this._entries = [];
    this._maxEntries = config.maxEntries ?? 1000;
  }

  /**
   * Set log level
   */
  setLevel(level: LogLevel): void {
    this._level = level;
  }

  /**
   * Get current log level
   */
  getLevel(): LogLevel {
    return this._level;
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: Record<string, unknown>): void {
    this._log(LogLevel.DEBUG, message, context);
  }

  /**
   * Log info message
   */
  info(message: string, context?: Record<string, unknown>): void {
    this._log(LogLevel.INFO, message, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this._log(LogLevel.WARN, message, context);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    const errorObj = error instanceof Error ? error : undefined;
    this._log(LogLevel.ERROR, message, context, errorObj);
  }

  /**
   * Get all log entries
   */
  getEntries(): LogEntry[] {
    return [...this._entries];
  }

  /**
   * Clear all log entries
   */
  clear(): void {
    this._entries = [];
  }

  /**
   * Get entries by level
   */
  getEntriesByLevel(level: LogLevel): LogEntry[] {
    return this._entries.filter((entry) => entry.level === level);
  }

  private _log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ): void {
    if (level < this._level) return;

    const entry: LogEntry = {
      level,
      timestamp: Date.now(),
      message,
      context,
      error,
    };

    // Store entry (with max limit)
    this._entries.push(entry);
    if (this._entries.length > this._maxEntries) {
      this._entries.shift();
    }

    // Console output
    if (this._enableConsole) {
      this._consoleLog(entry);
    }
  }

  private _consoleLog(entry: LogEntry): void {
    const prefix = `${this._prefix} [${LogLevel[entry.level]}]`;
    const message = `${prefix} ${entry.message}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.warn(message, entry.context ?? '');
        break;
      case LogLevel.INFO:
        console.warn(message, entry.context ?? '');
        break;
      case LogLevel.WARN:
        console.warn(message, entry.context ?? '');
        break;
      case LogLevel.ERROR:
        console.error(message, entry.error ?? entry.context ?? '');
        break;
    }
  }
}

// Error tracker for capturing and reporting errors
export interface ErrorEntry {
  timestamp: number;
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
}

export class ErrorTracker {
  private _errors: ErrorEntry[] = [];
  private _maxErrors: number = 100;

  capture(error: Error | unknown, context?: Record<string, unknown>): void {
    const errorObj =
      error instanceof Error
        ? error
        : new Error(typeof error === 'string' ? error : 'Unknown error');

    const entry: ErrorEntry = {
      timestamp: Date.now(),
      message: errorObj.message,
      stack: errorObj.stack,
      context,
    };

    this._errors.push(entry);
    if (this._errors.length > this._maxErrors) {
      this._errors.shift();
    }

    // Also log to console in development
    if (typeof window !== 'undefined' && (window as { __ADSERVER_DEBUG__?: boolean }).__ADSERVER_DEBUG__) {
      console.error('[AdServerSDK] Error captured:', entry);
    }
  }

  getErrors(): ErrorEntry[] {
    return [...this._errors];
  }

  clear(): void {
    this._errors = [];
  }

  getCount(): number {
    return this._errors.length;
  }
}

// Singleton instances
let globalLogger: Logger | null = null;
let globalErrorTracker: ErrorTracker | null = null;

export function getLogger(config?: LoggerConfig): Logger {
  if (!globalLogger && config) {
    globalLogger = new Logger(config);
  } else if (!globalLogger) {
    globalLogger = new Logger();
  }
  return globalLogger;
}

export function getErrorTracker(): ErrorTracker {
  if (!globalErrorTracker) {
    globalErrorTracker = new ErrorTracker();
  }
  return globalErrorTracker;
}

export function resetTelemetry(): void {
  globalLogger = null;
  globalErrorTracker = null;
}
