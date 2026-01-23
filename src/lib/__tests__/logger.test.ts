import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLogger, logger } from '../logger';

describe('Logger', () => {
  const originalEnv = process.env.NODE_ENV;
  let consoleSpy: {
    log: ReturnType<typeof vi.spyOn>;
    warn: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env.NODE_ENV = originalEnv;
  });

  describe('createLogger', () => {
    it('should create a logger with context', () => {
      const testLogger = createLogger('TestContext');
      expect(testLogger).toBeDefined();
    });

    it('should include context in log output', () => {
      process.env.NODE_ENV = 'development';
      const testLogger = createLogger('TestContext');
      testLogger.info('Test message');

      expect(consoleSpy.log).toHaveBeenCalled();
      const logCall = consoleSpy.log.mock.calls[0][0];
      expect(logCall).toContain('[TestContext]');
      expect(logCall).toContain('Test message');
    });
  });

  describe('log levels', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('should log debug messages in development', () => {
      logger.debug('Debug message');
      expect(consoleSpy.log).toHaveBeenCalled();
    });

    it('should log info messages', () => {
      logger.info('Info message');
      expect(consoleSpy.log).toHaveBeenCalled();
    });

    it('should log warnings', () => {
      logger.warn('Warning message');
      expect(consoleSpy.warn).toHaveBeenCalled();
    });

    it('should log errors', () => {
      logger.error('Error message');
      expect(consoleSpy.error).toHaveBeenCalled();
    });

    it('should not log debug in production', () => {
      process.env.NODE_ENV = 'production';
      const prodLogger = createLogger('ProdTest');
      prodLogger.debug('Debug message');
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });
  });

  describe('sensitive data redaction', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('should redact password fields', () => {
      const testLogger = createLogger('RedactionTest');
      testLogger.info('User data', { password: 'secret123', name: 'John' });

      const logCall = consoleSpy.log.mock.calls[0][0];
      expect(logCall).not.toContain('secret123');
      expect(logCall).toContain('[REDACTED]');
      expect(logCall).toContain('John');
    });

    it('should redact BSN fields', () => {
      const testLogger = createLogger('RedactionTest');
      testLogger.info('User data', { bsnNumber: '123456789', name: 'John' });

      const logCall = consoleSpy.log.mock.calls[0][0];
      expect(logCall).not.toContain('123456789');
      expect(logCall).toContain('[REDACTED]');
    });

    it('should redact token fields', () => {
      const testLogger = createLogger('RedactionTest');
      testLogger.info('Auth data', { token: 'jwt-token-here', userId: '123' });

      const logCall = consoleSpy.log.mock.calls[0][0];
      expect(logCall).not.toContain('jwt-token-here');
      expect(logCall).toContain('[REDACTED]');
    });

    it('should redact IBAN fields', () => {
      const testLogger = createLogger('RedactionTest');
      testLogger.info('Bank data', { iban: 'NL91ABNA0417164300', name: 'John' });

      const logCall = consoleSpy.log.mock.calls[0][0];
      expect(logCall).not.toContain('NL91ABNA0417164300');
      expect(logCall).toContain('[REDACTED]');
    });

    it('should partially redact email addresses', () => {
      const testLogger = createLogger('RedactionTest');
      testLogger.info('Contact', { contact: 'john.doe@example.com' });

      const logCall = consoleSpy.log.mock.calls[0][0];
      expect(logCall).not.toContain('john.doe@example.com');
      expect(logCall).toContain('jo***@example.com');
    });

    it('should handle nested objects', () => {
      const testLogger = createLogger('RedactionTest');
      testLogger.info('Nested data', {
        user: {
          name: 'John',
          credentials: {
            password: 'secret',
          },
        },
      });

      const logCall = consoleSpy.log.mock.calls[0][0];
      expect(logCall).not.toContain('secret');
      expect(logCall).toContain('[REDACTED]');
    });
  });

  describe('error logging', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('should include error details', () => {
      const testError = new Error('Test error message');
      logger.error('Something went wrong', testError);

      expect(consoleSpy.error).toHaveBeenCalled();
      const logCall = consoleSpy.error.mock.calls[0][0];
      expect(logCall).toContain('Test error message');
    });

    it('should include stack trace in development', () => {
      const testError = new Error('Test error');
      logger.error('Something went wrong', testError);

      const logCall = consoleSpy.error.mock.calls[0][0];
      expect(logCall).toContain('Error: Test error');
    });
  });

  describe('JSON format in production', () => {
    it('should output JSON in production', () => {
      process.env.NODE_ENV = 'production';
      const prodLogger = createLogger('ProdTest');
      prodLogger.info('Test message', { key: 'value' });

      expect(consoleSpy.log).toHaveBeenCalled();
      const logCall = consoleSpy.log.mock.calls[0][0];

      // Should be valid JSON
      const parsed = JSON.parse(logCall);
      expect(parsed.level).toBe('info');
      expect(parsed.message).toBe('Test message');
      expect(parsed.context).toBe('ProdTest');
    });
  });
});
