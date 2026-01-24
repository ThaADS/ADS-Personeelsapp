/**
 * Compliance Service
 * Handles GDPR/AVG and Dutch labor law compliance features
 *
 * Features:
 * - Data retention policies (Nederlandse wetgeving)
 * - Consent management
 * - Data access requests (GDPR Article 15-22)
 * - Data breach reporting
 * - Working time compliance (Arbeidstijdenwet)
 * - Automated data retention enforcement
 */

import { prisma } from '@/lib/db/prisma';
import { createLogger } from "@/lib/logger";

const logger = createLogger("compliance-service");

// Interface voor data retention policy
interface DataRetentionPolicy {
  dataType: string;
  retentionPeriod: number; // in dagen
  legalBasis: string;
  description: string;
}

// Interface voor consent record
export interface ConsentRecord {
  id: string;
  employeeId: string;
  consentType: string;
  granted: boolean;
  timestamp: string;
  expiresAt?: string;
  ipAddress?: string;
  userAgent?: string;
}

// Interface voor data access request
export interface DataAccessRequest {
  id: string;
  employeeId: string;
  requestType: 'access' | 'rectification' | 'erasure' | 'restriction' | 'portability' | 'objection';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requestDate: string;
  completionDate?: string;
  notes?: string;
}

// Interface voor data breach record
export interface DataBreachRecord {
  id: string;
  description: string;
  detectionDate: string;
  reportDate?: string;
  affectedDataTypes: string[];
  affectedEmployees?: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'detected' | 'investigating' | 'reported' | 'resolved';
  measures?: string;
  reportedToAuthority: boolean;
  reportedToDataSubjects: boolean;
}

// Interface voor arbeidsrecht compliance check
export interface LaborLawCheck {
  id: string;
  checkType: string;
  description: string;
  result: 'pass' | 'warning' | 'fail';
  details?: string;
  timestamp: string;
  relatedEmployeeId?: string;
}

// Data retention policies volgens Nederlandse wetgeving
export const dataRetentionPolicies: DataRetentionPolicy[] = [
  {
    dataType: 'personeelsdossier',
    retentionPeriod: 365 * 2, // 2 jaar na einde dienstverband
    legalBasis: 'Artikel 52 Wet op de loonbelasting 1964',
    description: 'Personeelsdossiers moeten 2 jaar bewaard worden na einde dienstverband'
  },
  {
    dataType: 'salarisadministratie',
    retentionPeriod: 365 * 7, // 7 jaar
    legalBasis: 'Artikel 52 Wet op de loonbelasting 1964',
    description: 'Salarisadministratie moet 7 jaar bewaard worden'
  },
  {
    dataType: 'verzuimgegevens',
    retentionPeriod: 365 * 2, // 2 jaar
    legalBasis: 'Arbowet',
    description: 'Verzuimgegevens moeten 2 jaar bewaard worden'
  },
  {
    dataType: 'sollicitatiegegevens',
    retentionPeriod: 30, // 4 weken, tenzij toestemming voor 1 jaar
    legalBasis: 'AVG',
    description: 'Sollicitatiegegevens mogen 4 weken bewaard worden, of 1 jaar met toestemming'
  }
];

/**
 * Controleert of een bepaald datatype verwijderd moet worden volgens het retentiebeleid
 */
export function checkDataRetention(dataType: string, creationDate: string): {
  shouldDelete: boolean;
  daysRemaining: number;
  policy?: DataRetentionPolicy;
} {
  const policy = dataRetentionPolicies.find(p => p.dataType === dataType);
  
  if (!policy) {
    return { shouldDelete: false, daysRemaining: -1 };
  }
  
  const creationTime = new Date(creationDate).getTime();
  const currentTime = new Date().getTime();
  const diffDays = Math.floor((currentTime - creationTime) / (1000 * 60 * 60 * 24));
  
  return {
    shouldDelete: diffDays >= policy.retentionPeriod,
    daysRemaining: Math.max(0, policy.retentionPeriod - diffDays),
    policy
  };
}

/**
 * Registreert een nieuwe toestemming
 */
export async function recordConsent(
  employeeId: string,
  consentType: string,
  granted: boolean
): Promise<ConsentRecord> {
  try {
    const response = await fetch('/api/compliance/consent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        employeeId,
        consentType,
        granted
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    logger.error("Error recording consent", error, { employeeId, consentType, granted });
    throw error;
  }
}

/**
 * Haalt toestemmingen op voor een werknemer
 */
export async function fetchConsents(employeeId: string): Promise<ConsentRecord[]> {
  try {
    const response = await fetch(`/api/compliance/consent?employeeId=${employeeId}`, {
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
    logger.error("Error fetching consents", error, { employeeId });
    throw error;
  }
}

/**
 * Dient een data access request in
 */
export async function submitDataAccessRequest(
  employeeId: string,
  requestType: 'access' | 'rectification' | 'erasure' | 'restriction' | 'portability' | 'objection',
  notes?: string
): Promise<DataAccessRequest> {
  try {
    const response = await fetch('/api/compliance/data-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        employeeId,
        requestType,
        notes
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    logger.error("Error submitting data access request", error, { employeeId, requestType });
    throw error;
  }
}

/**
 * Meldt een datalek
 */
export async function reportDataBreach(
  description: string,
  affectedDataTypes: string[],
  severity: 'low' | 'medium' | 'high' | 'critical',
  affectedEmployees?: string[]
): Promise<DataBreachRecord> {
  try {
    const response = await fetch('/api/compliance/data-breaches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description,
        affectedDataTypes,
        severity,
        affectedEmployees,
        detectionDate: new Date().toISOString()
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    logger.error("Error reporting data breach", error, { severity, affectedDataTypes });
    throw error;
  }
}

/**
 * Voert een arbeidsrecht compliance check uit
 */
export async function performLaborLawCheck(
  checkType: string,
  employeeId?: string
): Promise<LaborLawCheck> {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('checkType', checkType);
    
    if (employeeId) {
      queryParams.append('employeeId', employeeId);
    }
    
    const response = await fetch(`/api/compliance/labor-law-checks?${queryParams.toString()}`, {
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
    logger.error("Error performing labor law check", error, { checkType, employeeId });
    throw error;
  }
}

/**
 * Controleert arbeidstijdenwet compliance voor een werknemer
 */
export async function checkWorkingTimeCompliance(
  employeeId: string,
  startDate: string,
  endDate: string
): Promise<LaborLawCheck[]> {
  try {
    const queryParams = new URLSearchParams({
      employeeId,
      startDate,
      endDate
    });
    
    const response = await fetch(`/api/compliance/working-time?${queryParams.toString()}`, {
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
    logger.error("Error checking working time compliance", error, { employeeId, startDate, endDate });
    throw error;
  }
}

/**
 * Genereert een privacyverklaring voor een werknemer
 */
export async function generatePrivacyStatement(employeeId: string): Promise<string> {
  try {
    const response = await fetch(`/api/compliance/privacy-statement?employeeId=${employeeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.statement;
  } catch (error) {
    logger.error("Error generating privacy statement", error, { employeeId });
    throw error;
  }
}

/**
 * Anonimiseert persoonsgegevens
 */
export function anonymizePersonalData(data: Record<string, string | number | boolean>): Record<string, string | number | boolean> {
  const result = { ...data };

  // Lijst van velden die geanonimiseerd moeten worden
  const fieldsToAnonymize = [
    'name', 'firstName', 'lastName', 'email', 'phone', 'address',
    'postalCode', 'city', 'birthDate', 'bsn', 'iban'
  ];

  // Anonimiseer de velden
  for (const field of fieldsToAnonymize) {
    if (field in result) {
      if (field === 'email') {
        result[field] = 'geanonimiseerd@voorbeeld.nl';
      } else if (field === 'phone') {
        result[field] = '06-XXXXXXXX';
      } else if (field === 'bsn') {
        result[field] = 'XXXXXXXXX';
      } else if (field === 'iban') {
        result[field] = 'NL00XXXX0000000000';
      } else {
        result[field] = 'Geanonimiseerd';
      }
    }
  }

  return result;
}

// ============================================================================
// Server-side Data Retention Enforcement Functions
// ============================================================================

export interface DataRetentionReport {
  tenantId: string;
  reportDate: string;
  summary: {
    totalItemsChecked: number;
    itemsExpired: number;
    itemsAnonymized: number;
    itemsDeleted: number;
    errors: number;
  };
  details: DataRetentionItem[];
}

export interface DataRetentionItem {
  dataType: string;
  recordId: string;
  creationDate: string;
  expirationDate: string;
  status: 'expired' | 'pending_deletion' | 'anonymized' | 'deleted';
  action?: 'anonymize' | 'delete' | 'none';
  error?: string;
}

/**
 * Maps data types to their database tables and date fields
 */
const dataTypeMapping: Record<string, { table: string; dateField: string; strategy: 'anonymize' | 'delete' }> = {
  sollicitatiegegevens: {
    table: 'invitations',
    dateField: 'created_at',
    strategy: 'delete', // Delete unused invitations
  },
  verzuimgegevens: {
    table: 'sick_leaves',
    dateField: 'created_at',
    strategy: 'anonymize', // Anonymize after retention period
  },
  // Note: personeelsdossier and salarisadministratie require more complex handling
  // as they span multiple tables and require employee termination date tracking
};

/**
 * Finds all data records due for deletion/anonymization for a tenant
 */
export async function findExpiredDataForTenant(tenantId: string): Promise<DataRetentionItem[]> {
  const expiredItems: DataRetentionItem[] = [];
  const now = new Date();

  for (const policy of dataRetentionPolicies) {
    const mapping = dataTypeMapping[policy.dataType];
    if (!mapping) continue;

    const expirationThreshold = new Date(now.getTime() - policy.retentionPeriod * 24 * 60 * 60 * 1000);

    try {
      // Query based on data type
      if (policy.dataType === 'sollicitatiegegevens') {
        const expiredInvitations = await prisma.invitation.findMany({
          where: {
            tenantId,
            createdAt: { lt: expirationThreshold },
            usedAt: null, // Only unused invitations
          },
          select: { id: true, createdAt: true },
        });

        for (const inv of expiredInvitations) {
          expiredItems.push({
            dataType: policy.dataType,
            recordId: inv.id,
            creationDate: inv.createdAt?.toISOString() || '',
            expirationDate: new Date(
              (inv.createdAt?.getTime() || 0) + policy.retentionPeriod * 24 * 60 * 60 * 1000
            ).toISOString(),
            status: 'expired',
            action: mapping.strategy,
          });
        }
      }

      if (policy.dataType === 'verzuimgegevens') {
        const expiredSickLeaves = await prisma.sick_leaves.findMany({
          where: {
            tenant_id: tenantId,
            created_at: { lt: expirationThreshold },
            status: 'RECOVERED', // Only archived sick leaves
          },
          select: { id: true, created_at: true },
        });

        for (const sl of expiredSickLeaves) {
          expiredItems.push({
            dataType: policy.dataType,
            recordId: sl.id,
            creationDate: sl.created_at?.toISOString() || '',
            expirationDate: new Date(
              (sl.created_at?.getTime() || 0) + policy.retentionPeriod * 24 * 60 * 60 * 1000
            ).toISOString(),
            status: 'expired',
            action: mapping.strategy,
          });
        }
      }
    } catch (error) {
      logger.error("Error finding expired data", error, { dataType: policy.dataType, tenantId });
      expiredItems.push({
        dataType: policy.dataType,
        recordId: 'error',
        creationDate: '',
        expirationDate: '',
        status: 'expired',
        action: 'none',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return expiredItems;
}

/**
 * Processes data retention for a single tenant - anonymizes or deletes expired data
 */
export async function processDataRetentionForTenant(
  tenantId: string,
  dryRun: boolean = true
): Promise<DataRetentionReport> {
  const expiredItems = await findExpiredDataForTenant(tenantId);

  const report: DataRetentionReport = {
    tenantId,
    reportDate: new Date().toISOString(),
    summary: {
      totalItemsChecked: expiredItems.length,
      itemsExpired: expiredItems.filter(i => i.status === 'expired').length,
      itemsAnonymized: 0,
      itemsDeleted: 0,
      errors: expiredItems.filter(i => i.error).length,
    },
    details: [],
  };

  for (const item of expiredItems) {
    if (item.error) {
      report.details.push(item);
      continue;
    }

    if (dryRun) {
      report.details.push({
        ...item,
        status: 'pending_deletion',
      });
      continue;
    }

    try {
      if (item.action === 'delete') {
        // Delete the record
        if (item.dataType === 'sollicitatiegegevens') {
          await prisma.invitation.delete({
            where: { id: item.recordId },
          });
          report.summary.itemsDeleted++;
          report.details.push({
            ...item,
            status: 'deleted',
          });
        }
      } else if (item.action === 'anonymize') {
        // Anonymize the record
        if (item.dataType === 'verzuimgegevens') {
          await prisma.sick_leaves.update({
            where: { id: item.recordId },
            data: {
              reason: 'Geanonimiseerd',
              // Keep medical_certificate and other flags for compliance reporting
            },
          });
          report.summary.itemsAnonymized++;
          report.details.push({
            ...item,
            status: 'anonymized',
          });
        }
      }
    } catch (error) {
      report.summary.errors++;
      report.details.push({
        ...item,
        status: 'expired',
        error: error instanceof Error ? error.message : 'Processing failed',
      });
    }
  }

  // Log the retention processing to audit log
  if (!dryRun && (report.summary.itemsDeleted > 0 || report.summary.itemsAnonymized > 0)) {
    await prisma.auditLog.create({
      data: {
        tenantId,
        action: 'DATA_RETENTION_PROCESSED',
        resource: 'Compliance',
        newValues: {
          itemsAnonymized: report.summary.itemsAnonymized,
          itemsDeleted: report.summary.itemsDeleted,
          processedAt: report.reportDate,
        },
      },
    });
  }

  return report;
}

/**
 * Gets data retention status summary for all tenants (superuser function)
 */
export async function getGlobalRetentionStatus(): Promise<{
  totalTenants: number;
  tenantsWithExpiredData: number;
  expiredItemsByType: Record<string, number>;
  lastProcessedAt?: string;
}> {
  const tenants = await prisma.tenant.findMany({
    where: {
      isArchived: { not: true },
    },
    select: { id: true },
  });

  const expiredItemsByType: Record<string, number> = {};
  let tenantsWithExpiredData = 0;

  for (const tenant of tenants) {
    const items = await findExpiredDataForTenant(tenant.id);
    if (items.length > 0) {
      tenantsWithExpiredData++;
      for (const item of items) {
        expiredItemsByType[item.dataType] = (expiredItemsByType[item.dataType] || 0) + 1;
      }
    }
  }

  // Find last retention processing from audit logs
  const lastProcessing = await prisma.auditLog.findFirst({
    where: { action: 'DATA_RETENTION_PROCESSED' },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true },
  });

  return {
    totalTenants: tenants.length,
    tenantsWithExpiredData,
    expiredItemsByType,
    lastProcessedAt: lastProcessing?.createdAt?.toISOString(),
  };
}

/**
 * Find employees with terminated employment due for data deletion
 * According to Dutch law: 2 years after end of employment
 */
export async function findTerminatedEmployeesForDeletion(tenantId: string): Promise<{
  employeeId: string;
  userId: string;
  name: string;
  terminationDate: string;
  deletionDueDate: string;
  daysUntilDeletion: number;
}[]> {
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

  const terminatedEmployees = await prisma.employees.findMany({
    where: {
      tenant_id: tenantId,
      end_date: {
        not: null,
        lt: twoYearsAgo,
      },
    },
    include: {
      users: {
        select: { id: true, name: true },
      },
    },
  });

  return terminatedEmployees.map(emp => {
    const endDate = emp.end_date!;
    const deletionDueDate = new Date(endDate);
    deletionDueDate.setFullYear(deletionDueDate.getFullYear() + 2);

    const now = new Date();
    const daysUntilDeletion = Math.ceil(
      (deletionDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      employeeId: emp.id,
      userId: emp.user_id,
      name: emp.users.name || 'Unknown',
      terminationDate: endDate.toISOString(),
      deletionDueDate: deletionDueDate.toISOString(),
      daysUntilDeletion,
    };
  });
}
