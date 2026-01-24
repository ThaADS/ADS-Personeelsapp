/**
 * Payroll Integration Service
 *
 * Orchestrates payroll provider integrations and syncing
 */

import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';
import { NmbrsAdapter } from './nmbrs-adapter';
import type {
  PayrollProviderType,
  PayrollProviderCredentials,
  PayrollProviderAdapter,
  SyncResult,
  SyncType,
} from './types';

// Simple encryption for credentials (in production, use proper encryption)
// This is a placeholder - real implementation should use AES-256 or similar
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-for-dev';

function encrypt(text: string): string {
  // In production, use proper encryption library
  return Buffer.from(text).toString('base64');
}

function decrypt(encrypted: string): string {
  // In production, use proper decryption
  return Buffer.from(encrypted, 'base64').toString('utf8');
}

function encryptCredentials(credentials: PayrollProviderCredentials): PayrollProviderCredentials {
  const encrypted: PayrollProviderCredentials = { ...credentials };
  if (encrypted.apiToken) encrypted.apiToken = encrypt(encrypted.apiToken);
  if (encrypted.clientSecret) encrypted.clientSecret = encrypt(encrypted.clientSecret);
  if (encrypted.accessToken) encrypted.accessToken = encrypt(encrypted.accessToken);
  if (encrypted.refreshToken) encrypted.refreshToken = encrypt(encrypted.refreshToken);
  return encrypted;
}

function decryptCredentials(credentials: PayrollProviderCredentials): PayrollProviderCredentials {
  const decrypted: PayrollProviderCredentials = { ...credentials };
  if (decrypted.apiToken) decrypted.apiToken = decrypt(decrypted.apiToken);
  if (decrypted.clientSecret) decrypted.clientSecret = decrypt(decrypted.clientSecret);
  if (decrypted.accessToken) decrypted.accessToken = decrypt(decrypted.accessToken);
  if (decrypted.refreshToken) decrypted.refreshToken = decrypt(decrypted.refreshToken);
  return decrypted;
}

function createAdapter(
  providerType: PayrollProviderType,
  credentials: PayrollProviderCredentials
): PayrollProviderAdapter {
  switch (providerType) {
    case 'nmbrs':
      return new NmbrsAdapter(credentials);
    case 'afas':
    case 'loket':
    case 'exact':
      throw new Error(`Provider ${providerType} is nog niet geïmplementeerd`);
    default:
      throw new Error(`Onbekende provider: ${providerType}`);
  }
}

export class PayrollService {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  /**
   * Get configuration for a specific provider
   */
  async getConfig(providerType: PayrollProviderType) {
    const config = await prisma.payrollProviderConfig.findUnique({
      where: {
        tenant_id_provider_type: {
          tenant_id: this.tenantId,
          provider_type: providerType,
        },
      },
    });

    if (!config) return null;

    return {
      ...config,
      credentials: decryptCredentials(config.credentials as PayrollProviderCredentials),
    };
  }

  /**
   * Save or update configuration for a provider
   */
  async saveConfig(
    providerType: PayrollProviderType,
    credentials: PayrollProviderCredentials,
    options: {
      displayName?: string;
      syncEmployees?: boolean;
      syncHours?: boolean;
      syncLeave?: boolean;
      syncEnabled?: boolean;
      syncInterval?: number;
    } = {}
  ) {
    const encryptedCredentials = encryptCredentials(credentials);

    const config = await prisma.payrollProviderConfig.upsert({
      where: {
        tenant_id_provider_type: {
          tenant_id: this.tenantId,
          provider_type: providerType,
        },
      },
      update: {
        credentials: encryptedCredentials as unknown as Prisma.InputJsonValue,
        display_name: options.displayName,
        sync_employees: options.syncEmployees,
        sync_hours: options.syncHours,
        sync_leave: options.syncLeave,
        sync_enabled: options.syncEnabled,
        sync_interval: options.syncInterval,
        updated_at: new Date(),
      },
      create: {
        tenant_id: this.tenantId,
        provider_type: providerType,
        credentials: encryptedCredentials as unknown as Prisma.InputJsonValue,
        display_name: options.displayName || providerType.toUpperCase(),
        sync_employees: options.syncEmployees ?? true,
        sync_hours: options.syncHours ?? true,
        sync_leave: options.syncLeave ?? true,
        sync_enabled: options.syncEnabled ?? false,
        sync_interval: options.syncInterval ?? 1440,
      },
    });

    return config;
  }

  /**
   * Test connection to a provider
   */
  async testConnection(providerType: PayrollProviderType) {
    const config = await this.getConfig(providerType);
    if (!config) {
      return { success: false, message: 'Configuratie niet gevonden' };
    }

    const adapter = createAdapter(providerType, config.credentials as PayrollProviderCredentials);
    const result = await adapter.testConnection();

    // Update connection status
    await prisma.payrollProviderConfig.update({
      where: {
        tenant_id_provider_type: {
          tenant_id: this.tenantId,
          provider_type: providerType,
        },
      },
      data: {
        connection_status: result.success ? 'connected' : 'error',
        last_sync_error: result.success ? null : result.message,
        updated_at: new Date(),
      },
    });

    return result;
  }

  /**
   * Sync employees from payroll provider
   */
  async syncEmployees(providerType: PayrollProviderType): Promise<SyncResult> {
    const logId = await this.startSyncLog(providerType, 'employees');

    try {
      const config = await this.getConfig(providerType);
      if (!config) {
        throw new Error('Configuratie niet gevonden');
      }

      const adapter = createAdapter(providerType, config.credentials as PayrollProviderCredentials);
      const employees = await adapter.fetchEmployees();

      let synced = 0;
      let failed = 0;
      const errors: Array<{ record?: string; message: string }> = [];

      for (const emp of employees) {
        try {
          // Find or create user and employee record
          // Match by employee number or email
          const existingEmployee = await prisma.employees.findFirst({
            where: {
              tenant_id: this.tenantId,
              OR: [
                { employee_number: emp.employeeNumber || '' },
                { users: { email: emp.email || '' } },
              ],
            },
            include: { users: true },
          });

          if (existingEmployee) {
            // Update existing employee
            await prisma.employees.update({
              where: { id: existingEmployee.id },
              data: {
                employee_number: emp.employeeNumber,
                position: emp.position,
                hours_per_week: emp.hoursPerWeek,
                start_date: emp.startDate || existingEmployee.start_date,
                end_date: emp.endDate,
                updated_at: new Date(),
              },
            });

            // Update user record if needed
            if (existingEmployee.users && emp.bsnNumber) {
              await prisma.user.update({
                where: { id: existingEmployee.users.id },
                data: {
                  bsnNumber: emp.bsnNumber,
                  bankAccountNumber: emp.bankAccountNumber,
                },
              });
            }
          }
          // Note: We don't create new employees automatically to avoid orphaned records
          // New employees should be created through the normal onboarding flow

          synced++;
        } catch (error) {
          failed++;
          errors.push({
            record: emp.externalId,
            message: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      const result: SyncResult = {
        success: failed === 0,
        syncType: 'employees',
        recordsSynced: synced,
        recordsFailed: failed,
        errors: errors.length > 0 ? errors : undefined,
      };

      await this.completeSyncLog(logId, result);
      await this.updateLastSync(providerType, result);

      return result;
    } catch (error) {
      const result: SyncResult = {
        success: false,
        syncType: 'employees',
        recordsSynced: 0,
        recordsFailed: 0,
        errors: [{ message: error instanceof Error ? error.message : 'Unknown error' }],
      };

      await this.completeSyncLog(logId, result);
      throw error;
    }
  }

  /**
   * Push hours to payroll provider
   */
  async pushHours(
    providerType: PayrollProviderType,
    startDate: Date,
    endDate: Date
  ): Promise<SyncResult> {
    const logId = await this.startSyncLog(providerType, 'hours');

    try {
      const config = await this.getConfig(providerType);
      if (!config) {
        throw new Error('Configuratie niet gevonden');
      }

      const adapter = createAdapter(providerType, config.credentials as PayrollProviderCredentials);

      if (!adapter.pushHours) {
        throw new Error(`Provider ${providerType} ondersteunt geen uren synchronisatie`);
      }

      // Fetch approved timesheets
      const timesheets = await prisma.timesheet.findMany({
        where: {
          tenantId: this.tenantId,
          status: 'APPROVED',
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          user: {
            include: {
              employees: true,
            },
          },
        },
      });

      // Convert to payroll format
      const hourEntries = timesheets.map((ts) => ({
        externalId: ts.id,
        employeeExternalId: ts.user.employees?.employee_number || ts.userId,
        date: ts.date,
        hours: Number(ts.total_hours) || 0,
        type: 'regular' as const,
        description: ts.description || undefined,
        status: 'approved' as const,
      }));

      const result = await adapter.pushHours(hourEntries);

      await this.completeSyncLog(logId, result);
      await this.updateLastSync(providerType, result);

      return result;
    } catch (error) {
      const result: SyncResult = {
        success: false,
        syncType: 'hours',
        recordsSynced: 0,
        recordsFailed: 0,
        errors: [{ message: error instanceof Error ? error.message : 'Unknown error' }],
      };

      await this.completeSyncLog(logId, result);
      throw error;
    }
  }

  /**
   * Get sync history
   */
  async getSyncHistory(providerType?: PayrollProviderType, limit = 10) {
    return prisma.payrollSyncLog.findMany({
      where: {
        tenant_id: this.tenantId,
        ...(providerType && { provider_type: providerType }),
      },
      orderBy: { created_at: 'desc' },
      take: limit,
    });
  }

  private async startSyncLog(providerType: PayrollProviderType, syncType: SyncType): Promise<string> {
    const log = await prisma.payrollSyncLog.create({
      data: {
        tenant_id: this.tenantId,
        provider_type: providerType,
        sync_type: syncType,
        status: 'pending',
        started_at: new Date(),
      },
    });
    return log.id;
  }

  private async completeSyncLog(logId: string, result: SyncResult) {
    await prisma.payrollSyncLog.update({
      where: { id: logId },
      data: {
        status: result.success ? 'success' : result.recordsSynced > 0 ? 'partial' : 'error',
        records_synced: result.recordsSynced,
        records_failed: result.recordsFailed,
        error_message: result.errors?.[0]?.message,
        error_details: result.errors as unknown as Prisma.InputJsonValue,
        completed_at: new Date(),
      },
    });
  }

  private async updateLastSync(providerType: PayrollProviderType, result: SyncResult) {
    await prisma.payrollProviderConfig.update({
      where: {
        tenant_id_provider_type: {
          tenant_id: this.tenantId,
          provider_type: providerType,
        },
      },
      data: {
        last_sync: new Date(),
        last_sync_error: result.success ? null : result.errors?.[0]?.message,
        connection_status: result.success ? 'connected' : 'error',
        updated_at: new Date(),
      },
    });
  }
}
