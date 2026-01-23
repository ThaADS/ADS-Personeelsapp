/**
 * Zod Validation Schemas for Employee Data
 * Comprehensive input validation for GDPR compliance and data integrity
 */

import { z } from 'zod';

// ============================================
// Reusable Field Validators
// ============================================

// Nederlandse telefoon nummers
const phoneSchema = z.string()
  .regex(/^(\+31|0031|0)[1-9][0-9]{8}$|^06[0-9]{8}$/, {
    message: 'Ongeldig telefoonnummer. Gebruik formaat: 0612345678 of +31612345678',
  })
  .optional()
  .nullable();

// Nederlandse postcode
const postalCodeSchema = z.string()
  .regex(/^[1-9][0-9]{3}\s?[A-Za-z]{2}$/, {
    message: 'Ongeldige postcode. Gebruik formaat: 1234 AB',
  })
  .transform(val => val?.toUpperCase().replace(/\s/g, ' ').replace(/([0-9]{4})([A-Z]{2})/, '$1 $2'))
  .optional()
  .nullable();

// BSN nummer (9 cijfers met 11-proef)
const bsnSchema = z.string()
  .regex(/^[0-9]{9}$/, {
    message: 'BSN moet 9 cijfers zijn',
  })
  .refine((bsn) => {
    // 11-proef validatie voor BSN
    if (!bsn || bsn.length !== 9) return false;
    const digits = bsn.split('').map(Number);
    const sum =
      digits[0] * 9 +
      digits[1] * 8 +
      digits[2] * 7 +
      digits[3] * 6 +
      digits[4] * 5 +
      digits[5] * 4 +
      digits[6] * 3 +
      digits[7] * 2 +
      digits[8] * -1;
    return sum % 11 === 0;
  }, {
    message: 'Ongeldig BSN nummer (11-proef check gefaald)',
  })
  .optional()
  .nullable();

// IBAN nummer
const ibanSchema = z.string()
  .regex(/^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/, {
    message: 'Ongeldig IBAN nummer',
  })
  .transform(val => val?.toUpperCase().replace(/\s/g, ''))
  .optional()
  .nullable();

// Email
const emailSchema = z.string()
  .email({ message: 'Ongeldig e-mailadres' })
  .max(255, { message: 'E-mailadres mag maximaal 255 tekens zijn' });

// Password
const passwordSchema = z.string()
  .min(8, { message: 'Wachtwoord moet minimaal 8 tekens zijn' })
  .max(128, { message: 'Wachtwoord mag maximaal 128 tekens zijn' })
  .regex(/[A-Z]/, { message: 'Wachtwoord moet minimaal 1 hoofdletter bevatten' })
  .regex(/[a-z]/, { message: 'Wachtwoord moet minimaal 1 kleine letter bevatten' })
  .regex(/[0-9]/, { message: 'Wachtwoord moet minimaal 1 cijfer bevatten' });

// Date string
const dateStringSchema = z.string()
  .refine((date) => !isNaN(Date.parse(date)), {
    message: 'Ongeldige datum',
  });

// Contract types
const contractTypeSchema = z.enum([
  'FULLTIME',
  'PARTTIME',
  'FLEX',
  'TEMPORARY',
  'INTERN',
]).optional().nullable();

// User roles
const userRoleSchema = z.enum([
  'USER',
  'MANAGER',
  'TENANT_ADMIN',
]).default('USER');

// Gender
const genderSchema = z.enum([
  'MALE',
  'FEMALE',
  'OTHER',
  'PREFER_NOT_TO_SAY',
]).optional().nullable();

// Marital status
const maritalStatusSchema = z.enum([
  'SINGLE',
  'MARRIED',
  'DIVORCED',
  'WIDOWED',
  'PARTNERED',
  'OTHER',
]).optional().nullable();

// ============================================
// Employee Create Schema
// ============================================

export const createEmployeeSchema = z.object({
  // Required fields
  email: emailSchema,
  name: z.string()
    .min(2, { message: 'Naam moet minimaal 2 tekens zijn' })
    .max(100, { message: 'Naam mag maximaal 100 tekens zijn' }),
  password: passwordSchema,

  // Role and status
  role: userRoleSchema,

  // Contact info
  phone: phoneSchema,

  // Employment details
  department: z.string().max(100).optional().nullable(),
  position: z.string().max(100).optional().nullable(),
  employeeId: z.string().max(50).optional().nullable(),
  startDate: dateStringSchema.optional().nullable(),
  endDate: dateStringSchema.optional().nullable(),
  contractType: contractTypeSchema,
  hoursPerWeek: z.union([
    z.number().min(0).max(80),
    z.string().transform(val => parseFloat(val)).refine(val => !isNaN(val) && val >= 0 && val <= 80),
  ]).optional().nullable(),
  hourlyRate: z.union([
    z.number().min(0).max(1000),
    z.string().transform(val => parseFloat(val)).refine(val => !isNaN(val) && val >= 0),
  ]).optional().nullable(),
  costCenter: z.string().max(50).optional().nullable(),

  // Personal details
  dateOfBirth: dateStringSchema
    .refine((date) => {
      const dob = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      return age >= 15 && age <= 100; // Werknemer moet tussen 15 en 100 jaar oud zijn
    }, { message: 'Ongeldige geboortedatum (werknemer moet tussen 15 en 100 jaar zijn)' })
    .optional()
    .nullable(),
  gender: genderSchema,
  nationality: z.string().max(100).optional().nullable(),
  maritalStatus: maritalStatusSchema,

  // Address
  address: z.string().max(200).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  postalCode: postalCodeSchema,

  // Sensitive data (BSN, bank)
  bankAccountNumber: ibanSchema,
  bankAccountName: z.string().max(100).optional().nullable(),
  bsnNumber: bsnSchema,

  // Emergency contact
  emergencyContact: z.string().max(100).optional().nullable(),
  emergencyPhone: phoneSchema,
  emergencyRelationship: z.string().max(50).optional().nullable(),

  // Skills and qualifications
  skills: z.array(z.string().max(100)).max(50).default([]),
  certifications: z.array(z.string().max(100)).max(50).default([]),
  educationLevel: z.string().max(100).optional().nullable(),
  languages: z.array(z.string().max(50)).max(20).default([]),

  // Work preferences
  remoteWorkAllowed: z.boolean().default(false),
  workLocation: z.string().max(200).optional().nullable(),

  // Vehicle assignments
  vehicleIds: z.array(z.string().uuid()).max(10).optional(),
});

// ============================================
// Employee Update Schema
// ============================================

export const updateEmployeeSchema = z.object({
  // Basic info (all optional for updates)
  name: z.string().min(2).max(100).optional(),
  phone: phoneSchema,

  // Role and status
  role: userRoleSchema.optional(),
  isActive: z.boolean().optional(),

  // Employment details
  department: z.string().max(100).optional().nullable(),
  position: z.string().max(100).optional().nullable(),
  employeeId: z.string().max(50).optional().nullable(),
  startDate: dateStringSchema.optional().nullable(),
  endDate: dateStringSchema.optional().nullable(),
  contractType: contractTypeSchema,
  hoursPerWeek: z.union([
    z.number().min(0).max(80),
    z.string().transform(val => parseFloat(val)).refine(val => !isNaN(val) && val >= 0 && val <= 80),
  ]).optional().nullable(),
  hourlyRate: z.union([
    z.number().min(0).max(1000),
    z.string().transform(val => parseFloat(val)).refine(val => !isNaN(val) && val >= 0),
  ]).optional().nullable(),
  costCenter: z.string().max(50).optional().nullable(),
  managerId: z.string().uuid().optional().nullable(),
  departmentId: z.string().uuid().optional().nullable(),

  // Personal details
  dateOfBirth: dateStringSchema
    .refine((date) => {
      const dob = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      return age >= 15 && age <= 100;
    }, { message: 'Ongeldige geboortedatum' })
    .optional()
    .nullable(),
  gender: genderSchema,
  nationality: z.string().max(100).optional().nullable(),
  maritalStatus: maritalStatusSchema,

  // Address
  address: z.string().max(200).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  postalCode: postalCodeSchema,

  // Sensitive data (BSN, bank)
  bankAccountNumber: ibanSchema,
  bankAccountName: z.string().max(100).optional().nullable(),
  bsnNumber: bsnSchema,

  // Emergency contact
  emergencyContact: z.string().max(100).optional().nullable(),
  emergencyPhone: phoneSchema,
  emergencyRelationship: z.string().max(50).optional().nullable(),

  // Skills and qualifications
  skills: z.array(z.string().max(100)).max(50).optional(),
  certifications: z.array(z.string().max(100)).max(50).optional(),
  educationLevel: z.string().max(100).optional().nullable(),
  languages: z.array(z.string().max(50)).max(20).optional(),

  // Work preferences
  remoteWorkAllowed: z.boolean().optional(),
  workLocation: z.string().max(200).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),

  // Vehicle assignments
  vehicleIds: z.array(z.string().uuid()).max(10).optional(),
});

// ============================================
// Type Exports
// ============================================

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

// ============================================
// Validation Helper Functions
// ============================================

export function validateCreateEmployee(data: unknown) {
  return createEmployeeSchema.safeParse(data);
}

export function validateUpdateEmployee(data: unknown) {
  return updateEmployeeSchema.safeParse(data);
}

/**
 * Formatteert Zod validation errors naar een leesbaar formaat
 */
export function formatValidationErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const issue of error.issues) {
    const path = issue.path.join('.');
    errors[path] = issue.message;
  }

  return errors;
}

/**
 * Creëert een API error response van validation errors
 */
export function createValidationErrorResponse(error: z.ZodError) {
  return {
    error: 'Validatie gefaald',
    details: formatValidationErrors(error),
    issues: error.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    })),
  };
}
