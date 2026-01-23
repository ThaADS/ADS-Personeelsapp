/**
 * Structured Logger with Sensitive Data Redaction
 * Production-aware logging utility
 */

// Sensitive field patterns to redact
const SENSITIVE_PATTERNS = [
  /password/i,
  /bsn/i,
  /iban/i,
  /bank/i,
  /token/i,
  /secret/i,
  /key/i,
  /credential/i,
  /auth/i,
];

// Patterns for sensitive values
const SENSITIVE_VALUE_PATTERNS = [
  /^[0-9]{9}$/, // BSN
  /^NL[0-9]{2}[A-Z]{4}[0-9]{10}$/, // IBAN
  /^[A-Za-z0-9-_]{20,}$/, // Tokens
];

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Check if a field name is sensitive
 */
function isSensitiveField(fieldName: string): boolean {
  return SENSITIVE_PATTERNS.some(pattern => pattern.test(fieldName));
}

/**
 * Check if a value looks like sensitive data
 */
function isSensitiveValue(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  return SENSITIVE_VALUE_PATTERNS.some(pattern => pattern.test(value));
}

/**
 * Redact sensitive data from an object
 */
function redactSensitiveData<T>(data: T, depth = 0): T {
  if (depth > 10) return data; // Prevent infinite recursion

  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    if (isSensitiveValue(data)) {
      return '[REDACTED]' as T;
    }
    // Redact email addresses partially
    if (data.includes('@') && data.includes('.')) {
      const [local, domain] = data.split('@');
      if (local.length > 2) {
        return `${local.substring(0, 2)}***@${domain}` as T;
      }
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => redactSensitiveData(item, depth + 1)) as T;
  }

  if (typeof data === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (isSensitiveField(key)) {
        result[key] = '[REDACTED]';
      } else {
        result[key] = redactSensitiveData(value, depth + 1);
      }
    }
    return result as T;
  }

  return data;
}

/**
 * Format log entry for output
 */
function formatLogEntry(entry: LogEntry): string {
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (isDevelopment) {
    // Pretty format for development
    const parts = [
      `[${entry.timestamp}]`,
      `[${entry.level.toUpperCase()}]`,
      entry.context ? `[${entry.context}]` : '',
      entry.message,
    ].filter(Boolean);

    let output = parts.join(' ');

    if (entry.data) {
      output += '\n' + JSON.stringify(redactSensitiveData(entry.data), null, 2);
    }

    if (entry.error) {
      output += `\nError: ${entry.error.message}`;
      if (entry.error.stack) {
        output += `\n${entry.error.stack}`;
      }
    }

    return output;
  } else {
    // JSON format for production (easier to parse)
    return JSON.stringify({
      ...entry,
      data: entry.data ? redactSensitiveData(entry.data) : undefined,
    });
  }
}

/**
 * Create log entry
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  context?: string,
  data?: Record<string, unknown>,
  error?: Error
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
    data,
    error: error ? {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    } : undefined,
  };
}

/**
 * Logger class with context support
 */
class Logger {
  private context?: string;
  private isProduction = process.env.NODE_ENV === 'production';

  constructor(context?: string) {
    this.context = context;
  }

  /**
   * Create a child logger with context
   */
  child(context: string): Logger {
    return new Logger(context);
  }

  /**
   * Debug level - only in development
   */
  debug(message: string, data?: Record<string, unknown>): void {
    if (this.isProduction) return;
    const entry = createLogEntry('debug', message, this.context, data);
    console.log(formatLogEntry(entry));
  }

  /**
   * Info level
   */
  info(message: string, data?: Record<string, unknown>): void {
    const entry = createLogEntry('info', message, this.context, data);
    console.log(formatLogEntry(entry));
  }

  /**
   * Warning level
   */
  warn(message: string, data?: Record<string, unknown>): void {
    const entry = createLogEntry('warn', message, this.context, data);
    console.warn(formatLogEntry(entry));
  }

  /**
   * Error level
   */
  error(message: string, error?: Error | unknown, data?: Record<string, unknown>): void {
    const err = error instanceof Error ? error : undefined;
    const entry = createLogEntry('error', message, this.context, data, err);
    console.error(formatLogEntry(entry));
  }
}

// Default logger instance
export const logger = new Logger();

// Named export for creating contextualized loggers
export function createLogger(context: string): Logger {
  return new Logger(context);
}

// Export types
export type { Logger, LogEntry, LogLevel };
