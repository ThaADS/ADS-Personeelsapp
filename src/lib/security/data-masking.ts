/**
 * Data Masking Utility voor GDPR/AVG compliance
 * Maskeert gevoelige velden tenzij expliciet geautoriseerd
 */

// Sensitive fields die standaard gemaskeerd moeten worden
export const SENSITIVE_FIELDS = {
  // Financieel
  bankAccountNumber: true,
  bankAccountName: true,
  iban: true,
  hourlyRate: true,

  // Identificatie
  bsnNumber: true,
  bsn: true,
  passportNumber: true,
  idNumber: true,

  // Persoonlijk
  dateOfBirth: true,
  address: true,
  postalCode: true,

  // Noodcontact (privacy)
  emergencyContact: true,
  emergencyPhone: true,
} as const;

export type SensitiveField = keyof typeof SENSITIVE_FIELDS;

// Masking patterns per field type
const MASK_PATTERNS: Record<string, string> = {
  bankAccountNumber: 'NL** **** **** ****',
  bankAccountName: '********',
  iban: 'NL** **** **** ****',
  bsnNumber: '*********',
  bsn: '*********',
  passportNumber: '**********',
  idNumber: '**********',
  dateOfBirth: '****-**-**',
  address: '********',
  postalCode: '****',
  emergencyContact: '********',
  emergencyPhone: '**-********',
  hourlyRate: '***.**',
};

// Partial masking - toont eerste/laatste karakters
function partialMask(value: string, showFirst: number = 0, showLast: number = 4): string {
  if (!value || value.length <= showFirst + showLast) {
    return '*'.repeat(value?.length || 8);
  }

  const first = value.slice(0, showFirst);
  const last = value.slice(-showLast);
  const middle = '*'.repeat(Math.max(4, value.length - showFirst - showLast));

  return `${first}${middle}${last}`;
}

/**
 * Maskeer een specifieke waarde op basis van field type
 */
export function maskValue(fieldName: string, value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  // Check of het een sensitive field is
  if (!(fieldName in SENSITIVE_FIELDS)) {
    return value;
  }

  const stringValue = String(value);

  // Gebruik specifiek mask pattern of partial masking
  switch (fieldName) {
    case 'bankAccountNumber':
    case 'iban':
      // Toon alleen laatste 4 cijfers: NL** **** **** 1234
      return partialMask(stringValue.replace(/\s/g, ''), 2, 4);

    case 'bsnNumber':
    case 'bsn':
      // Volledig gemaskeerd voor BSN (zeer gevoelig)
      return '*********';

    case 'dateOfBirth':
      // Toon alleen jaar: ****-**-** of 1990-**-**
      if (typeof value === 'string' && value.includes('-')) {
        const year = value.split('-')[0];
        return `${year}-**-**`;
      }
      return '****-**-**';

    case 'hourlyRate':
      // Volledig gemaskeerd
      return '***.**';

    case 'address':
      // Toon alleen eerste woord (straatnaam begin)
      const words = stringValue.split(' ');
      if (words.length > 1) {
        return `${words[0]} ********`;
      }
      return '********';

    case 'postalCode':
      // Toon alleen cijfers: 1234 **
      const match = stringValue.match(/^\d{4}/);
      return match ? `${match[0]} **` : '****';

    case 'emergencyPhone':
      // Toon alleen eerste 2 cijfers
      return partialMask(stringValue.replace(/[^0-9]/g, ''), 2, 0);

    default:
      return MASK_PATTERNS[fieldName] || '********';
  }
}

/**
 * Maskeer alle gevoelige velden in een object
 */
export function maskSensitiveData<T extends Record<string, unknown>>(
  data: T,
  options: {
    /** Velden die NIET gemaskeerd moeten worden (whitelist) */
    allowedFields?: string[];
    /** Extra velden die WEL gemaskeerd moeten worden */
    additionalSensitiveFields?: string[];
    /** Volledig masking (geen partial reveal) */
    fullMask?: boolean;
  } = {}
): T {
  const { allowedFields = [], additionalSensitiveFields = [], fullMask = false } = options;

  const result = { ...data };

  for (const [key, value] of Object.entries(result)) {
    // Skip als het veld expliciet is toegestaan
    if (allowedFields.includes(key)) {
      continue;
    }

    // Check of het een sensitive field is
    const isSensitive = key in SENSITIVE_FIELDS || additionalSensitiveFields.includes(key);

    if (isSensitive) {
      if (fullMask) {
        result[key as keyof T] = (typeof value === 'number' ? 0 : '********') as T[keyof T];
      } else {
        result[key as keyof T] = maskValue(key, value) as T[keyof T];
      }
    }

    // Recursief voor nested objects
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key as keyof T] = maskSensitiveData(
        value as Record<string, unknown>,
        options
      ) as T[keyof T];
    }

    // Voor arrays van objects
    if (Array.isArray(value)) {
      result[key as keyof T] = value.map(item => {
        if (item && typeof item === 'object') {
          return maskSensitiveData(item as Record<string, unknown>, options);
        }
        return item;
      }) as T[keyof T];
    }
  }

  return result;
}

/**
 * Check of een gebruiker toegang heeft tot ongemaskeerde data
 * Dit vereist specifieke permissies
 */
export function canAccessUnmaskedData(
  userRole: string,
  requestedFields: string[] = []
): boolean {
  // Alleen TENANT_ADMIN en SUPERUSER kunnen ongemaskeerde data zien
  // En alleen voor specifieke use cases (bijv. export, administratie)
  if (userRole === 'SUPERUSER') {
    return true;
  }

  if (userRole === 'TENANT_ADMIN') {
    // TENANT_ADMIN kan sommige velden zien, maar niet alles
    const adminAllowedFields = ['bankAccountNumber', 'bankAccountName', 'address', 'postalCode'];
    return requestedFields.every(field => adminAllowedFields.includes(field));
  }

  return false;
}

/**
 * Helper om te bepalen welke velden getoond mogen worden
 */
export function getAllowedFieldsForRole(userRole: string): string[] {
  switch (userRole) {
    case 'SUPERUSER':
      return Object.keys(SENSITIVE_FIELDS); // Alles toegestaan

    case 'TENANT_ADMIN':
      // Admin mag financiele en adres data zien (voor administratie)
      return ['bankAccountNumber', 'bankAccountName', 'address', 'postalCode', 'hourlyRate'];

    case 'MANAGER':
      // Manager mag alleen noodcontact zien
      return ['emergencyContact', 'emergencyPhone'];

    default:
      return []; // Geen toegang tot sensitive data
  }
}

/**
 * Wrapper functie voor API responses
 * Past automatisch masking toe op basis van user role
 */
export function maskApiResponse<T extends Record<string, unknown>>(
  data: T,
  userRole: string,
  options: {
    /** Request expliciet om ongemaskeerde data (vereist audit log) */
    requestUnmasked?: boolean;
    /** Specifieke velden om te unmasken */
    unmaskedFields?: string[];
  } = {}
): { data: T; masked: boolean; unmaskedFields: string[] } {
  const { requestUnmasked = false, unmaskedFields = [] } = options;

  // Bepaal welke velden getoond mogen worden
  let allowedFields: string[] = [];

  if (requestUnmasked) {
    // Als unmasked is aangevraagd, check permissies
    allowedFields = unmaskedFields.filter(field =>
      canAccessUnmaskedData(userRole, [field])
    );
  } else {
    // Standaard: alleen role-based toegang
    allowedFields = getAllowedFieldsForRole(userRole);
  }

  const maskedData = maskSensitiveData(data, { allowedFields });

  return {
    data: maskedData,
    masked: allowedFields.length < Object.keys(SENSITIVE_FIELDS).length,
    unmaskedFields: allowedFields,
  };
}
