/**
 * Standardized API Response Utilities
 * Provides consistent response structure for all API endpoints
 */

import { NextResponse } from 'next/server';

// Standard API response types
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  _meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface ApiPaginatedResponse<T> extends ApiSuccessResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// Standard error codes
export const ErrorCodes = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // Resource
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',

  // Rate limiting
  RATE_LIMITED: 'RATE_LIMITED',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',

  // Server
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',

  // Business logic
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  OPERATION_NOT_ALLOWED: 'OPERATION_NOT_ALLOWED',
  TENANT_NOT_FOUND: 'TENANT_NOT_FOUND',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

// HTTP status code mapping
const errorStatusCodes: Record<string, number> = {
  [ErrorCodes.UNAUTHORIZED]: 401,
  [ErrorCodes.FORBIDDEN]: 403,
  [ErrorCodes.INVALID_CREDENTIALS]: 401,
  [ErrorCodes.SESSION_EXPIRED]: 401,
  [ErrorCodes.INVALID_TOKEN]: 401,
  [ErrorCodes.VALIDATION_ERROR]: 400,
  [ErrorCodes.INVALID_INPUT]: 400,
  [ErrorCodes.MISSING_REQUIRED_FIELD]: 400,
  [ErrorCodes.NOT_FOUND]: 404,
  [ErrorCodes.ALREADY_EXISTS]: 409,
  [ErrorCodes.CONFLICT]: 409,
  [ErrorCodes.RATE_LIMITED]: 429,
  [ErrorCodes.TOO_MANY_REQUESTS]: 429,
  [ErrorCodes.INTERNAL_ERROR]: 500,
  [ErrorCodes.SERVICE_UNAVAILABLE]: 503,
  [ErrorCodes.DATABASE_ERROR]: 500,
  [ErrorCodes.INSUFFICIENT_PERMISSIONS]: 403,
  [ErrorCodes.OPERATION_NOT_ALLOWED]: 403,
  [ErrorCodes.TENANT_NOT_FOUND]: 404,
};

/**
 * Create a success response
 */
export function successResponse<T>(
  data: T,
  options?: {
    message?: string;
    meta?: Record<string, unknown>;
    status?: number;
  }
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
  };

  if (options?.message) {
    response.message = options.message;
  }

  if (options?.meta) {
    response._meta = options.meta;
  }

  return NextResponse.json(response, { status: options?.status || 200 });
}

/**
 * Create a paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
  options?: {
    meta?: Record<string, unknown>;
  }
): NextResponse<ApiPaginatedResponse<T>> {
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  const response: ApiPaginatedResponse<T> = {
    success: true,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages,
      hasNext: pagination.page < totalPages,
      hasPrev: pagination.page > 1,
    },
  };

  if (options?.meta) {
    response._meta = options.meta;
  }

  return NextResponse.json(response);
}

/**
 * Create an error response
 */
export function errorResponse(
  code: ErrorCode,
  message: string,
  details?: Record<string, unknown>,
  statusOverride?: number
): NextResponse<ApiErrorResponse> {
  const status = statusOverride || errorStatusCodes[code] || 500;

  const response: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };

  return NextResponse.json(response, { status });
}

/**
 * Create a validation error response from Zod errors
 */
export function validationErrorResponse(
  errors: Record<string, string>,
  message = 'Validatie gefaald'
): NextResponse<ApiErrorResponse> {
  return errorResponse(ErrorCodes.VALIDATION_ERROR, message, { fields: errors });
}

/**
 * Create an unauthorized response
 */
export function unauthorizedResponse(
  message = 'Niet geautoriseerd'
): NextResponse<ApiErrorResponse> {
  return errorResponse(ErrorCodes.UNAUTHORIZED, message);
}

/**
 * Create a forbidden response
 */
export function forbiddenResponse(
  message = 'Onvoldoende rechten'
): NextResponse<ApiErrorResponse> {
  return errorResponse(ErrorCodes.FORBIDDEN, message);
}

/**
 * Create a not found response
 */
export function notFoundResponse(
  resource = 'Resource',
  message?: string
): NextResponse<ApiErrorResponse> {
  return errorResponse(
    ErrorCodes.NOT_FOUND,
    message || `${resource} niet gevonden`
  );
}

/**
 * Create an internal error response
 */
export function internalErrorResponse(
  message = 'Er is een interne fout opgetreden'
): NextResponse<ApiErrorResponse> {
  return errorResponse(ErrorCodes.INTERNAL_ERROR, message);
}

/**
 * Create a rate limited response
 */
export function rateLimitResponse(
  retryAfter: number,
  message = 'Te veel verzoeken. Probeer het later opnieuw.'
): NextResponse<ApiErrorResponse> {
  const response = errorResponse(ErrorCodes.RATE_LIMITED, message, { retryAfter });

  // Add Retry-After header
  response.headers.set('Retry-After', retryAfter.toString());

  return response;
}

/**
 * Type guard to check if response is an error
 */
export function isApiError(response: ApiResponse): response is ApiErrorResponse {
  return !response.success;
}

/**
 * Type guard to check if response is successful
 */
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
  return response.success;
}
