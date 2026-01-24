/**
 * Sensitive Data Access Audit Logging
 * GDPR/AVG compliant logging for personal data access
 */

import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';
import { headers } from 'next/headers';
import { SENSITIVE_FIELDS } from './data-masking';
import { createLogger } from '@/lib/logger';

const logger = createLogger('SensitiveDataAudit');

// Types for sensitive data access logging
export interface SensitiveDataAccessLog {
  userId: string;
  tenantId: string;
  userRole: string;
  action: 'VIEW' | 'EXPORT' | 'MODIFY' | 'DELETE';
  resourceType: string;
  resourceId: string;
  fieldsAccessed: string[];
  unmaskedFields: string[];
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  reason?: string;
}

/**
 * Haal IP adres op uit request headers
 */
export async function getClientIP(): Promise<string> {
  try {
    const headersList = await headers();

    // Check verschillende headers voor IP (in volgorde van betrouwbaarheid)
    const forwardedFor = headersList.get('x-forwarded-for');
    if (forwardedFor) {
      // X-Forwarded-For kan meerdere IPs bevatten, pak de eerste (client)
      return forwardedFor.split(',')[0].trim();
    }

    const realIP = headersList.get('x-real-ip');
    if (realIP) {
      return realIP;
    }

    const cfConnectingIP = headersList.get('cf-connecting-ip'); // Cloudflare
    if (cfConnectingIP) {
      return cfConnectingIP;
    }

    return 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Haal user agent op uit request headers
 */
export async function getUserAgent(): Promise<string> {
  try {
    const headersList = await headers();
    return headersList.get('user-agent') || 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Detecteer welke sensitive fields in een object aanwezig zijn
 */
export function detectSensitiveFields(data: Record<string, unknown>): string[] {
  const sensitiveFields: string[] = [];

  function checkObject(obj: Record<string, unknown>, prefix = ''): void {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (key in SENSITIVE_FIELDS) {
        if (value !== null && value !== undefined) {
          sensitiveFields.push(fullKey);
        }
      }

      // Recursief voor nested objects
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        checkObject(value as Record<string, unknown>, fullKey);
      }

      // Voor arrays van objects
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (item && typeof item === 'object') {
            checkObject(item as Record<string, unknown>, `${fullKey}[${index}]`);
          }
        });
      }
    }
  }

  checkObject(data);
  return sensitiveFields;
}

/**
 * Log sensitive data access naar de audit log
 */
export async function logSensitiveDataAccess(params: {
  userId: string;
  tenantId: string;
  userRole: string;
  action: 'VIEW' | 'EXPORT' | 'MODIFY' | 'DELETE';
  resourceType: string;
  resourceId: string;
  dataAccessed: Record<string, unknown>;
  unmaskedFields?: string[];
  reason?: string;
}): Promise<void> {
  const {
    userId,
    tenantId,
    userRole,
    action,
    resourceType,
    resourceId,
    dataAccessed,
    unmaskedFields = [],
    reason,
  } = params;

  try {
    const ipAddress = await getClientIP();
    const userAgent = await getUserAgent();

    // Detecteer welke sensitive fields zijn benaderd
    const fieldsAccessed = detectSensitiveFields(dataAccessed);

    // Alleen loggen als er daadwerkelijk sensitive fields zijn benaderd
    if (fieldsAccessed.length === 0) {
      return;
    }

    // Creëer audit log entry
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: `SENSITIVE_DATA_${action}`,
        resource: resourceType,
        resourceId,
        oldValues: Prisma.JsonNull,
        newValues: JSON.stringify({
          sensitiveFieldsAccessed: fieldsAccessed,
          unmaskedFields,
          accessReason: reason || 'Standard API access',
          userRole,
          ipAddress,
          userAgent,
          timestamp: new Date().toISOString(),
        }),
      },
    });
  } catch (error) {
    // Log error maar gooi niet - audit logging mag niet de request blokkeren
    logger.error('Failed to log sensitive data access', error);
  }
}

/**
 * Log wanneer iemand unmasked data opvraagt
 */
export async function logUnmaskedDataRequest(params: {
  userId: string;
  tenantId: string;
  userRole: string;
  resourceType: string;
  resourceId: string;
  requestedFields: string[];
  grantedFields: string[];
  deniedFields: string[];
}): Promise<void> {
  const {
    userId,
    tenantId,
    userRole,
    resourceType,
    resourceId,
    requestedFields,
    grantedFields,
    deniedFields,
  } = params;

  try {
    const ipAddress = await getClientIP();
    const userAgent = await getUserAgent();

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'SENSITIVE_DATA_UNMASK_REQUEST',
        resource: resourceType,
        resourceId,
        oldValues: Prisma.JsonNull,
        newValues: JSON.stringify({
          requestedFields,
          grantedFields,
          deniedFields,
          userRole,
          ipAddress,
          userAgent,
          timestamp: new Date().toISOString(),
          accessGranted: deniedFields.length === 0,
        }),
      },
    });
  } catch (error) {
    logger.error('Failed to log unmasked data request', error);
  }
}

/**
 * Log data export van sensitive data
 */
export async function logSensitiveDataExport(params: {
  userId: string;
  tenantId: string;
  userRole: string;
  exportType: 'CSV' | 'EXCEL' | 'PDF' | 'JSON';
  recordCount: number;
  sensitiveFieldsIncluded: string[];
  reason?: string;
}): Promise<void> {
  const {
    userId,
    tenantId,
    userRole,
    exportType,
    recordCount,
    sensitiveFieldsIncluded,
    reason,
  } = params;

  try {
    const ipAddress = await getClientIP();
    const userAgent = await getUserAgent();

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'SENSITIVE_DATA_EXPORT',
        resource: 'BulkExport',
        resourceId: `export_${Date.now()}`,
        oldValues: Prisma.JsonNull,
        newValues: JSON.stringify({
          exportType,
          recordCount,
          sensitiveFieldsIncluded,
          exportReason: reason || 'User requested export',
          userRole,
          ipAddress,
          userAgent,
          timestamp: new Date().toISOString(),
        }),
      },
    });
  } catch (error) {
    logger.error('Failed to log sensitive data export', error);
  }
}

/**
 * Wrapper functie om automatisch sensitive data access te loggen
 * Gebruik dit rond data fetching functies
 */
export async function withSensitiveDataLogging<T extends Record<string, unknown>>(
  params: {
    userId: string;
    tenantId: string;
    userRole: string;
    resourceType: string;
    resourceId: string;
  },
  fetchData: () => Promise<T>
): Promise<T> {
  const data = await fetchData();

  // Log de access asynchroon (niet blokkeren)
  logSensitiveDataAccess({
    ...params,
    action: 'VIEW',
    dataAccessed: data,
  }).catch(() => {
    // Silently fail - logging should not break the request
  });

  return data;
}
