/**
 * Nmbrs API Adapter
 *
 * Integrates with Nmbrs (nmbrs.nl) for Dutch payroll administration
 * API Documentation: https://api.nmbrs.nl/
 */

import type {
  PayrollProviderAdapter,
  PayrollProviderCredentials,
  PayrollEmployee,
  PayrollHourEntry,
  PayrollLeaveEntry,
  SyncResult,
} from './types';
import { createLogger } from '@/lib/logger';

const logger = createLogger('NmbrsAdapter');

interface NmbrsEmployee {
  Id: number;
  EmployeeNumber?: string;
  FirstName: string;
  LastName: string;
  Email?: string;
  DateOfBirth?: string;
  StartDate?: string;
  EndDate?: string;
  Department?: string;
  Function?: string;
  PartTimePercentage?: number;
  ContractType?: string;
  BSN?: string;
  BankAccountNumber?: string;
}

interface NmbrsHourEntry {
  Id: number;
  EmployeeId: number;
  Date: string;
  Hours: number;
  HourType: string;
  Description?: string;
  Status?: string;
}

interface NmbrsAbsence {
  Id: number;
  EmployeeId: number;
  AbsenceType: string;
  StartDate: string;
  EndDate: string;
  Hours?: number;
  Days?: number;
  Status?: string;
  Description?: string;
}

export class NmbrsAdapter implements PayrollProviderAdapter {
  readonly providerType = 'nmbrs' as const;
  readonly displayName = 'Nmbrs';
  readonly requiredCredentials = ['apiToken', 'domain', 'companyId'];
  readonly supportedFeatures = {
    syncEmployees: true,
    syncHours: true,
    syncLeave: true,
    pushHours: true,
    pushLeave: false, // Nmbrs doesn't support pushing leave via API
  };

  private credentials: PayrollProviderCredentials;
  private baseUrl: string;

  constructor(credentials: PayrollProviderCredentials) {
    this.credentials = credentials;
    const domain = credentials.domain || 'api.nmbrs.nl';
    const env = credentials.environment === 'sandbox' ? 'sandbox-api' : 'api';
    this.baseUrl = `https://${env}.nmbrs.nl/soap/v3`;
  }

  private async makeRequest<T>(service: string, method: string, params: Record<string, unknown> = {}): Promise<T> {
    // Nmbrs uses SOAP API - we'll build the SOAP envelope
    const soapEnvelope = this.buildSoapEnvelope(service, method, params);

    const response = await fetch(`${this.baseUrl}/${service}.asmx`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        SOAPAction: `https://api.nmbrs.nl/soap/v3/${service}/${method}`,
        Authorization: `Bearer ${this.credentials.apiToken}`,
      },
      body: soapEnvelope,
    });

    if (!response.ok) {
      throw new Error(`Nmbrs API error: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    return this.parseSoapResponse<T>(text, method);
  }

  private buildSoapEnvelope(service: string, method: string, params: Record<string, unknown>): string {
    const paramsXml = Object.entries(params)
      .map(([key, value]) => `<${key}>${this.escapeXml(String(value))}</${key}>`)
      .join('');

    return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:ns="https://api.nmbrs.nl/soap/v3/${service}">
  <soap:Header>
    <ns:AuthHeaderWithDomain>
      <ns:Token>${this.escapeXml(this.credentials.apiToken || '')}</ns:Token>
      <ns:Domain>${this.escapeXml(this.credentials.domain || '')}</ns:Domain>
    </ns:AuthHeaderWithDomain>
  </soap:Header>
  <soap:Body>
    <ns:${method}>
      <ns:CompanyId>${this.escapeXml(this.credentials.companyId || '')}</ns:CompanyId>
      ${paramsXml}
    </ns:${method}>
  </soap:Body>
</soap:Envelope>`;
  }

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private parseSoapResponse<T>(xml: string, method: string): T {
    // Simple XML parsing - in production, use a proper XML parser
    // This extracts the response body from the SOAP envelope
    const responseMatch = xml.match(new RegExp(`<${method}Result>([\\s\\S]*?)</${method}Result>`));
    if (!responseMatch) {
      // Check for fault
      const faultMatch = xml.match(/<faultstring>([\s\S]*?)<\/faultstring>/);
      if (faultMatch) {
        throw new Error(`Nmbrs SOAP Fault: ${faultMatch[1]}`);
      }
      throw new Error('Invalid SOAP response');
    }

    // Parse the XML result into JSON (simplified)
    return this.xmlToJson(responseMatch[1]) as T;
  }

  private xmlToJson(xml: string): unknown {
    // Simplified XML to JSON conversion
    // In production, use a proper library like fast-xml-parser
    const result: Record<string, unknown> = {};

    const tagRegex = /<(\w+)(?:\s[^>]*)?>([^<]*)<\/\1>/g;
    let match;

    while ((match = tagRegex.exec(xml)) !== null) {
      const [, tag, value] = match;
      if (result[tag]) {
        if (!Array.isArray(result[tag])) {
          result[tag] = [result[tag]];
        }
        (result[tag] as unknown[]).push(value || this.xmlToJson(match[2]));
      } else {
        result[tag] = value || this.xmlToJson(match[2]);
      }
    }

    return Object.keys(result).length > 0 ? result : xml;
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Test connection by fetching company info
      await this.makeRequest<unknown>('CompanyService', 'Company_GetCurrent', {});
      return { success: true, message: 'Verbinding met Nmbrs succesvol' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Verbinding mislukt';
      return { success: false, message };
    }
  }

  async fetchEmployees(): Promise<PayrollEmployee[]> {
    try {
      const response = await this.makeRequest<{ Employee: NmbrsEmployee[] }>(
        'EmployeeService',
        'Employee_GetAll',
        {}
      );

      const employees = Array.isArray(response.Employee)
        ? response.Employee
        : response.Employee
        ? [response.Employee]
        : [];

      return employees.map((emp) => ({
        externalId: String(emp.Id),
        employeeNumber: emp.EmployeeNumber,
        firstName: emp.FirstName,
        lastName: emp.LastName,
        email: emp.Email,
        dateOfBirth: emp.DateOfBirth ? new Date(emp.DateOfBirth) : undefined,
        startDate: emp.StartDate ? new Date(emp.StartDate) : undefined,
        endDate: emp.EndDate ? new Date(emp.EndDate) : undefined,
        department: emp.Department,
        position: emp.Function,
        hoursPerWeek: emp.PartTimePercentage ? (emp.PartTimePercentage / 100) * 40 : 40,
        contractType: this.mapContractType(emp.ContractType),
        bsnNumber: emp.BSN,
        bankAccountNumber: emp.BankAccountNumber,
      }));
    } catch (error) {
      logger.error('Error fetching employees', error);
      throw error;
    }
  }

  async fetchHours(startDate: Date, endDate: Date): Promise<PayrollHourEntry[]> {
    try {
      const response = await this.makeRequest<{ HourEntry: NmbrsHourEntry[] }>(
        'HourService',
        'Hour_GetAll',
        {
          StartDate: startDate.toISOString().split('T')[0],
          EndDate: endDate.toISOString().split('T')[0],
        }
      );

      const entries = Array.isArray(response.HourEntry)
        ? response.HourEntry
        : response.HourEntry
        ? [response.HourEntry]
        : [];

      return entries.map((entry) => ({
        externalId: String(entry.Id),
        employeeExternalId: String(entry.EmployeeId),
        date: new Date(entry.Date),
        hours: entry.Hours,
        type: this.mapHourType(entry.HourType),
        description: entry.Description,
        status: this.mapStatus(entry.Status),
      }));
    } catch (error) {
      logger.error('Error fetching hours', error);
      throw error;
    }
  }

  async fetchLeave(startDate: Date, endDate: Date): Promise<PayrollLeaveEntry[]> {
    try {
      const response = await this.makeRequest<{ Absence: NmbrsAbsence[] }>(
        'AbsenceService',
        'Absence_GetAll',
        {
          StartDate: startDate.toISOString().split('T')[0],
          EndDate: endDate.toISOString().split('T')[0],
        }
      );

      const absences = Array.isArray(response.Absence)
        ? response.Absence
        : response.Absence
        ? [response.Absence]
        : [];

      return absences.map((absence) => ({
        externalId: String(absence.Id),
        employeeExternalId: String(absence.EmployeeId),
        type: this.mapAbsenceType(absence.AbsenceType),
        startDate: new Date(absence.StartDate),
        endDate: new Date(absence.EndDate),
        hours: absence.Hours,
        days: absence.Days,
        status: this.mapStatus(absence.Status),
        description: absence.Description,
      }));
    } catch (error) {
      logger.error('Error fetching leave', error);
      throw error;
    }
  }

  async pushHours(entries: PayrollHourEntry[]): Promise<SyncResult> {
    const errors: Array<{ record?: string; message: string; code?: string }> = [];
    let synced = 0;

    for (const entry of entries) {
      try {
        await this.makeRequest('HourService', 'Hour_Insert', {
          EmployeeId: entry.employeeExternalId,
          Date: entry.date.toISOString().split('T')[0],
          Hours: entry.hours,
          HourType: this.reverseMapHourType(entry.type),
          Description: entry.description || '',
        });
        synced++;
      } catch (error) {
        errors.push({
          record: entry.externalId,
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      success: errors.length === 0,
      syncType: 'hours',
      recordsSynced: synced,
      recordsFailed: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  private mapContractType(type?: string): string {
    const mapping: Record<string, string> = {
      Fulltime: 'FULLTIME',
      Parttime: 'PARTTIME',
      Flex: 'FLEX',
      Temporary: 'TEMPORARY',
      Intern: 'INTERN',
    };
    return mapping[type || ''] || 'FULLTIME';
  }

  private mapHourType(type: string): 'regular' | 'overtime' | 'sick' | 'vacation' | 'other' {
    const mapping: Record<string, 'regular' | 'overtime' | 'sick' | 'vacation' | 'other'> = {
      Regular: 'regular',
      Overtime: 'overtime',
      Sick: 'sick',
      Vacation: 'vacation',
      Holiday: 'vacation',
    };
    return mapping[type] || 'other';
  }

  private reverseMapHourType(type: string): string {
    const mapping: Record<string, string> = {
      regular: 'Regular',
      overtime: 'Overtime',
      sick: 'Sick',
      vacation: 'Vacation',
      other: 'Other',
    };
    return mapping[type] || 'Other';
  }

  private mapAbsenceType(type: string): 'vacation' | 'sick' | 'special' | 'unpaid' {
    const mapping: Record<string, 'vacation' | 'sick' | 'special' | 'unpaid'> = {
      Vacation: 'vacation',
      Holiday: 'vacation',
      Sick: 'sick',
      Special: 'special',
      Unpaid: 'unpaid',
    };
    return mapping[type] || 'vacation';
  }

  private mapStatus(status?: string): 'pending' | 'approved' | 'rejected' | undefined {
    if (!status) return undefined;
    const mapping: Record<string, 'pending' | 'approved' | 'rejected'> = {
      Pending: 'pending',
      Approved: 'approved',
      Rejected: 'rejected',
    };
    return mapping[status];
  }
}
