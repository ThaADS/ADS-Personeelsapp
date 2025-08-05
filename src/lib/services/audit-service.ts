/**
 * Audit Service
 * Handles audit logging, reporting, and regulatory integration
 */

// Interface voor audit log entry
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName?: string;
  action: string;
  category: AuditCategory;
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

// Audit categorieën
export type AuditCategory = 
  | 'authentication'
  | 'data_access'
  | 'data_modification'
  | 'approval'
  | 'export'
  | 'admin'
  | 'compliance'
  | 'system';

// Interface voor audit zoekopties
export interface AuditSearchOptions {
  startDate?: string;
  endDate?: string;
  userId?: string;
  category?: AuditCategory;
  action?: string;
  page?: number;
  limit?: number;
}

// Interface voor audit response met paginering
export interface AuditResponse {
  items: AuditLogEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Logt een audit entry
 * @param userId ID van de gebruiker die de actie uitvoert
 * @param action Beschrijving van de actie
 * @param category Categorie van de actie
 * @param details Details van de actie
 * @returns Promise met de gemaakte audit log entry
 */
export async function logAuditEvent(
  userId: string,
  action: string,
  category: AuditCategory,
  details: Record<string, unknown>
): Promise<AuditLogEntry> {
  try {
    const response = await fetch('/api/audit/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        action,
        category,
        details,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error logging audit event:', error);
    // Fallback naar lokale logging als de API niet beschikbaar is
    const fallbackEntry = {
      id: `local-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId,
      action,
      category,
      details,
    };
    console.warn('Fallback audit log:', fallbackEntry);
    return fallbackEntry as AuditLogEntry;
  }
}

/**
 * Haalt audit logs op op basis van zoekopties
 * @param options Zoekopties voor audit logs
 * @returns Promise met audit logs en paginering
 */
export async function fetchAuditLogs(options: AuditSearchOptions = {}): Promise<AuditResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    // Voeg zoekopties toe aan query parameters
    if (options.startDate) queryParams.append('startDate', options.startDate);
    if (options.endDate) queryParams.append('endDate', options.endDate);
    if (options.userId) queryParams.append('userId', options.userId);
    if (options.category) queryParams.append('category', options.category);
    if (options.action) queryParams.append('action', options.action);
    if (options.page) queryParams.append('page', options.page.toString());
    if (options.limit) queryParams.append('limit', options.limit.toString());
    
    const response = await fetch(`/api/audit/logs?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }
}

/**
 * Genereert een audit rapport voor een specifieke periode
 * @param startDate Begin datum voor het rapport
 * @param endDate Eind datum voor het rapport
 * @param format Formaat van het rapport (pdf, csv, json)
 * @returns Promise met de URL naar het gegenereerde rapport
 */
export async function generateAuditReport(
  startDate: string,
  endDate: string,
  format: 'pdf' | 'csv' | 'json' = 'pdf'
): Promise<string> {
  try {
    const response = await fetch('/api/audit/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate,
        format,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.reportUrl;
  } catch (error) {
    console.error('Error generating audit report:', error);
    throw error;
  }
}

/**
 * Genereert een UWV rapport voor ziekmeldingen
 * @param year Jaar voor het rapport
 * @param quarter Kwartaal voor het rapport (1-4)
 * @returns Promise met de URL naar het gegenereerde rapport
 */
export async function generateUWVReport(
  year: number,
  quarter: number
): Promise<string> {
  try {
    const response = await fetch('/api/reports/uwv', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        year,
        quarter,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.reportUrl;
  } catch (error) {
    console.error('Error generating UWV report:', error);
    throw error;
  }
}

/**
 * Genereert een belastingdienst rapport voor loonheffingen
 * @param year Jaar voor het rapport
 * @param month Maand voor het rapport (1-12)
 * @returns Promise met de URL naar het gegenereerde rapport
 */
export async function generateTaxReport(
  year: number,
  month: number
): Promise<string> {
  try {
    const response = await fetch('/api/reports/tax', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        year,
        month,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.reportUrl;
  } catch (error) {
    console.error('Error generating tax report:', error);
    throw error;
  }
}

/**
 * Genereert een AVG/GDPR compliance rapport
 * @returns Promise met de URL naar het gegenereerde rapport
 */
export async function generateGDPRComplianceReport(): Promise<string> {
  try {
    const response = await fetch('/api/reports/gdpr-compliance', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.reportUrl;
  } catch (error) {
    console.error('Error generating GDPR compliance report:', error);
    throw error;
  }
}

/**
 * Genereert een arbeidstijdenwet compliance rapport
 * @param startDate Begin datum voor het rapport
 * @param endDate Eind datum voor het rapport
 * @returns Promise met de URL naar het gegenereerde rapport
 */
export async function generateWorkingTimeReport(
  startDate: string,
  endDate: string
): Promise<string> {
  try {
    const response = await fetch('/api/reports/working-time', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.reportUrl;
  } catch (error) {
    console.error('Error generating working time report:', error);
    throw error;
  }
}
