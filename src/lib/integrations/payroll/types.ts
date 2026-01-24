/**
 * Payroll Integration Types
 * Shared types for all payroll provider integrations
 */

export type PayrollProviderType = 'nmbrs' | 'afas' | 'loket' | 'exact';

export type ConnectionStatus = 'unconfigured' | 'connected' | 'error';

export type SyncStatus = 'success' | 'partial' | 'error';

export type SyncType = 'employees' | 'hours' | 'leave' | 'full';

export interface PayrollProviderCredentials {
  // Nmbrs specific
  apiToken?: string;
  domain?: string; // e.g., company.nmbrs.nl
  companyId?: string;

  // Generic OAuth
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: string;

  // Environment
  environment?: 'sandbox' | 'production';
}

export interface PayrollEmployee {
  externalId: string;
  employeeNumber?: string;
  firstName: string;
  lastName: string;
  email?: string;
  dateOfBirth?: Date;
  startDate?: Date;
  endDate?: Date;
  department?: string;
  position?: string;
  hoursPerWeek?: number;
  contractType?: string;
  bsnNumber?: string;
  bankAccountNumber?: string;
}

export interface PayrollHourEntry {
  externalId: string;
  employeeExternalId: string;
  date: Date;
  hours: number;
  type: 'regular' | 'overtime' | 'sick' | 'vacation' | 'other';
  description?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface PayrollLeaveEntry {
  externalId: string;
  employeeExternalId: string;
  type: 'vacation' | 'sick' | 'special' | 'unpaid';
  startDate: Date;
  endDate: Date;
  hours?: number;
  days?: number;
  status?: 'pending' | 'approved' | 'rejected';
  description?: string;
}

export interface SyncResult {
  success: boolean;
  syncType: SyncType;
  recordsSynced: number;
  recordsFailed: number;
  errors?: Array<{
    record?: string;
    message: string;
    code?: string;
  }>;
  warnings?: string[];
}

export interface PayrollProviderAdapter {
  readonly providerType: PayrollProviderType;
  readonly displayName: string;
  readonly requiredCredentials: string[];
  readonly supportedFeatures: {
    syncEmployees: boolean;
    syncHours: boolean;
    syncLeave: boolean;
    pushHours: boolean;
    pushLeave: boolean;
  };

  // Connection
  testConnection(): Promise<{ success: boolean; message: string }>;

  // Sync operations
  fetchEmployees(): Promise<PayrollEmployee[]>;
  fetchHours(startDate: Date, endDate: Date): Promise<PayrollHourEntry[]>;
  fetchLeave(startDate: Date, endDate: Date): Promise<PayrollLeaveEntry[]>;

  // Push operations (optional)
  pushHours?(entries: PayrollHourEntry[]): Promise<SyncResult>;
  pushLeave?(entries: PayrollLeaveEntry[]): Promise<SyncResult>;
}
