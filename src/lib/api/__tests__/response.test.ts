import { describe, it, expect } from 'vitest';
import {
  successResponse,
  paginatedResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  internalErrorResponse,
  rateLimitResponse,
  isApiError,
  isApiSuccess,
  ErrorCodes,
  type ApiSuccessResponse,
  type ApiErrorResponse,
} from '../response';

describe('API Response Utilities', () => {
  describe('successResponse', () => {
    it('should create a success response with data', async () => {
      const data = { id: '123', name: 'Test' };
      const response = successResponse(data);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data).toEqual(data);
    });

    it('should include message when provided', async () => {
      const response = successResponse({ id: '1' }, { message: 'Created successfully' });
      const json = await response.json();

      expect(json.message).toBe('Created successfully');
    });

    it('should include meta when provided', async () => {
      const response = successResponse({ id: '1' }, { meta: { cached: true } });
      const json = await response.json();

      expect(json._meta).toEqual({ cached: true });
    });

    it('should use custom status code when provided', async () => {
      const response = successResponse({ id: '1' }, { status: 201 });
      expect(response.status).toBe(201);
    });
  });

  describe('paginatedResponse', () => {
    it('should create a paginated response', async () => {
      const data = [{ id: '1' }, { id: '2' }];
      const response = paginatedResponse(data, { page: 1, limit: 10, total: 50 });
      const json = await response.json();

      expect(json.success).toBe(true);
      expect(json.data).toEqual(data);
      expect(json.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 50,
        totalPages: 5,
        hasNext: true,
        hasPrev: false,
      });
    });

    it('should calculate hasNext and hasPrev correctly', async () => {
      const response = paginatedResponse([], { page: 3, limit: 10, total: 50 });
      const json = await response.json();

      expect(json.pagination.hasNext).toBe(true);
      expect(json.pagination.hasPrev).toBe(true);
    });

    it('should handle last page correctly', async () => {
      const response = paginatedResponse([], { page: 5, limit: 10, total: 50 });
      const json = await response.json();

      expect(json.pagination.hasNext).toBe(false);
      expect(json.pagination.hasPrev).toBe(true);
    });
  });

  describe('errorResponse', () => {
    it('should create an error response with code and message', async () => {
      const response = errorResponse(ErrorCodes.NOT_FOUND, 'Resource not found');
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('NOT_FOUND');
      expect(json.error.message).toBe('Resource not found');
    });

    it('should include details when provided', async () => {
      const response = errorResponse(ErrorCodes.VALIDATION_ERROR, 'Invalid input', {
        field: 'email',
        reason: 'invalid format',
      });
      const json = await response.json();

      expect(json.error.details).toEqual({
        field: 'email',
        reason: 'invalid format',
      });
    });

    it('should use correct status codes for different error codes', async () => {
      expect(errorResponse(ErrorCodes.UNAUTHORIZED, 'test').status).toBe(401);
      expect(errorResponse(ErrorCodes.FORBIDDEN, 'test').status).toBe(403);
      expect(errorResponse(ErrorCodes.NOT_FOUND, 'test').status).toBe(404);
      expect(errorResponse(ErrorCodes.CONFLICT, 'test').status).toBe(409);
      expect(errorResponse(ErrorCodes.RATE_LIMITED, 'test').status).toBe(429);
      expect(errorResponse(ErrorCodes.INTERNAL_ERROR, 'test').status).toBe(500);
    });

    it('should allow status override', async () => {
      const response = errorResponse(ErrorCodes.INTERNAL_ERROR, 'test', undefined, 503);
      expect(response.status).toBe(503);
    });
  });

  describe('validationErrorResponse', () => {
    it('should create a validation error response', async () => {
      const errors = { email: 'Invalid email', password: 'Too short' };
      const response = validationErrorResponse(errors);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error.code).toBe('VALIDATION_ERROR');
      expect(json.error.details).toEqual({ fields: errors });
    });

    it('should use custom message when provided', async () => {
      const response = validationErrorResponse({ email: 'Invalid' }, 'Custom error message');
      const json = await response.json();

      expect(json.error.message).toBe('Custom error message');
    });
  });

  describe('helper response functions', () => {
    it('unauthorizedResponse should return 401', async () => {
      const response = unauthorizedResponse();
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.error.code).toBe('UNAUTHORIZED');
    });

    it('forbiddenResponse should return 403', async () => {
      const response = forbiddenResponse();
      const json = await response.json();

      expect(response.status).toBe(403);
      expect(json.error.code).toBe('FORBIDDEN');
    });

    it('notFoundResponse should return 404', async () => {
      const response = notFoundResponse('User');
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.error.message).toBe('User niet gevonden');
    });

    it('internalErrorResponse should return 500', async () => {
      const response = internalErrorResponse();
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error.code).toBe('INTERNAL_ERROR');
    });

    it('rateLimitResponse should return 429 with Retry-After header', async () => {
      const response = rateLimitResponse(60);

      expect(response.status).toBe(429);
      expect(response.headers.get('Retry-After')).toBe('60');
    });
  });

  describe('type guards', () => {
    it('isApiError should correctly identify error responses', () => {
      const errorResp: ApiErrorResponse = {
        success: false,
        error: { code: 'ERROR', message: 'test' },
      };
      const successResp: ApiSuccessResponse = {
        success: true,
        data: {},
      };

      expect(isApiError(errorResp)).toBe(true);
      expect(isApiError(successResp)).toBe(false);
    });

    it('isApiSuccess should correctly identify success responses', () => {
      const errorResp: ApiErrorResponse = {
        success: false,
        error: { code: 'ERROR', message: 'test' },
      };
      const successResp: ApiSuccessResponse = {
        success: true,
        data: {},
      };

      expect(isApiSuccess(successResp)).toBe(true);
      expect(isApiSuccess(errorResp)).toBe(false);
    });
  });
});
