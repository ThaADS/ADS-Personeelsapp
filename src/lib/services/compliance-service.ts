/**
 * Compliance Service
 * Handles GDPR/AVG and Dutch labor law compliance features
 */

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
    console.error('Error recording consent:', error);
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
    console.error(`Error fetching consents for employee ${employeeId}:`, error);
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
    console.error('Error submitting data access request:', error);
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
    console.error('Error reporting data breach:', error);
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
    console.error(`Error performing labor law check ${checkType}:`, error);
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
    console.error(`Error checking working time compliance for employee ${employeeId}:`, error);
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
    console.error(`Error generating privacy statement for employee ${employeeId}:`, error);
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
