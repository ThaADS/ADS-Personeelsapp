/**
 * Approval Rules Service
 *
 * Configurable approval rules per tenant for:
 * - Timesheets
 * - Vacation requests
 * - Sick leave
 *
 * Rules can be configured in tenant settings and override defaults.
 */

import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';
import { UserRole } from '@/types';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface TimesheetApprovalRules {
  // Working time rules
  maxHoursPerDay: number; // Maximum hours allowed per day
  minBreakMinutes: number; // Minimum break required for long shifts
  breakRequiredAfterHours: number; // Hours after which break is required
  maxOvertimeHoursPerWeek: number; // Maximum overtime per week

  // Auto-approval rules
  autoApproveEnabled: boolean; // Enable auto-approval
  autoApproveMaxHours: number; // Auto-approve if under this many hours
  autoApproveOnWeekends: boolean; // Auto-approve weekend work

  // Required fields
  requireDescription: boolean; // Description is mandatory
  requireLocation: boolean; // GPS location is mandatory

  // Approval chain
  allowSelfApproval: boolean; // User can approve own timesheets (disabled by default)
  approvalRoles: UserRole[]; // Roles that can approve timesheets
}

export interface VacationApprovalRules {
  // Request rules
  minAdvanceNoticeDays: number; // Minimum days in advance to request
  maxConsecutiveDays: number; // Maximum consecutive vacation days
  maxDaysPerMonth: number; // Maximum vacation days per month
  blackoutDates: string[]; // Dates when vacation is not allowed (e.g., year-end)

  // Auto-approval rules
  autoApproveEnabled: boolean;
  autoApproveMaxDays: number; // Auto-approve if under this many days

  // Overlap rules
  allowOverlapWithTeamMembers: boolean;
  maxTeamMembersOnVacation: number; // Max team members on vacation at same time

  // Approval chain
  approvalRoles: UserRole[];
}

export interface SickLeaveRules {
  // Notification rules
  requireMedicalCertificateAfterDays: number; // Days after which certificate required
  uwvReportDeadlineDays: number; // Days to report to UWV (Dutch law: 42 days)

  // Documentation
  requireReasonForShortAbsence: boolean;
  shortAbsenceMaxDays: number;

  // Return to work
  requireReturnConfirmation: boolean;
  partialWorkAllowed: boolean;
}

export interface TenantApprovalConfig {
  timesheet: TimesheetApprovalRules;
  vacation: VacationApprovalRules;
  sickLeave: SickLeaveRules;
  updatedAt?: string;
  updatedBy?: string;
}

// ============================================================================
// Default Rules (Dutch Labor Law Compliant)
// ============================================================================

export const defaultTimesheetRules: TimesheetApprovalRules = {
  // Dutch Arbeidstijdenwet (Working Hours Act) compliance
  maxHoursPerDay: 12, // Max 12 hours per shift
  minBreakMinutes: 30, // Minimum 30 min break
  breakRequiredAfterHours: 5.5, // Break required after 5.5 hours
  maxOvertimeHoursPerWeek: 12, // Max 12 hours overtime per week

  // Auto-approval (disabled by default for compliance)
  autoApproveEnabled: false,
  autoApproveMaxHours: 8,
  autoApproveOnWeekends: false,

  // Required fields
  requireDescription: false,
  requireLocation: false,

  // Approval chain
  allowSelfApproval: false,
  approvalRoles: [UserRole.MANAGER, UserRole.TENANT_ADMIN],
};

export const defaultVacationRules: VacationApprovalRules = {
  // Request rules
  minAdvanceNoticeDays: 14, // 2 weeks notice
  maxConsecutiveDays: 20, // Max 4 weeks consecutive
  maxDaysPerMonth: 10, // Max 2 weeks per month
  blackoutDates: [], // None by default

  // Auto-approval
  autoApproveEnabled: false,
  autoApproveMaxDays: 1, // Auto-approve single days

  // Overlap rules
  allowOverlapWithTeamMembers: true,
  maxTeamMembersOnVacation: 3,

  // Approval chain
  approvalRoles: [UserRole.MANAGER, UserRole.TENANT_ADMIN],
};

export const defaultSickLeaveRules: SickLeaveRules = {
  // Dutch law compliance
  requireMedicalCertificateAfterDays: 3, // After 3 days
  uwvReportDeadlineDays: 42, // UWV must be notified within 42 days

  // Documentation
  requireReasonForShortAbsence: false, // Privacy protection
  shortAbsenceMaxDays: 2,

  // Return to work
  requireReturnConfirmation: true,
  partialWorkAllowed: true,
};

export const defaultApprovalConfig: TenantApprovalConfig = {
  timesheet: defaultTimesheetRules,
  vacation: defaultVacationRules,
  sickLeave: defaultSickLeaveRules,
};

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Get approval rules for a tenant, merging defaults with custom config
 */
export async function getTenantApprovalRules(tenantId: string): Promise<TenantApprovalConfig> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { settings: true },
  });

  if (!tenant?.settings) {
    return defaultApprovalConfig;
  }

  const settings = tenant.settings as Record<string, unknown>;
  const customRules = settings.approvalRules as Partial<TenantApprovalConfig> | undefined;

  if (!customRules) {
    return defaultApprovalConfig;
  }

  // Deep merge custom rules with defaults
  return {
    timesheet: {
      ...defaultTimesheetRules,
      ...(customRules.timesheet || {}),
    },
    vacation: {
      ...defaultVacationRules,
      ...(customRules.vacation || {}),
    },
    sickLeave: {
      ...defaultSickLeaveRules,
      ...(customRules.sickLeave || {}),
    },
    updatedAt: customRules.updatedAt,
    updatedBy: customRules.updatedBy,
  };
}

/**
 * Update approval rules for a tenant
 */
export async function updateTenantApprovalRules(
  tenantId: string,
  rules: Partial<TenantApprovalConfig>,
  updatedBy: string
): Promise<TenantApprovalConfig> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { settings: true },
  });

  const currentSettings = (tenant?.settings as Record<string, unknown>) || {};

  const updatedRules: Partial<TenantApprovalConfig> = {
    ...rules,
    updatedAt: new Date().toISOString(),
    updatedBy,
  };

  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      settings: {
        ...currentSettings,
        approvalRules: updatedRules,
      } as unknown as Prisma.InputJsonValue,
    },
  });

  // Log the update
  await prisma.auditLog.create({
    data: {
      tenantId,
      userId: updatedBy,
      action: 'APPROVAL_RULES_UPDATED',
      resource: 'TenantSettings',
      resourceId: tenantId,
      newValues: updatedRules as unknown as Prisma.InputJsonValue,
    },
  });

  return getTenantApprovalRules(tenantId);
}

/**
 * Reset tenant rules to defaults
 */
export async function resetTenantApprovalRules(
  tenantId: string,
  updatedBy: string
): Promise<TenantApprovalConfig> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { settings: true },
  });

  const currentSettings = (tenant?.settings as Record<string, unknown>) || {};
  delete currentSettings.approvalRules;

  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      settings: currentSettings as unknown as Prisma.InputJsonValue,
    },
  });

  // Log the reset
  await prisma.auditLog.create({
    data: {
      tenantId,
      userId: updatedBy,
      action: 'APPROVAL_RULES_RESET',
      resource: 'TenantSettings',
      resourceId: tenantId,
      oldValues: Prisma.JsonNull,
    },
  });

  return defaultApprovalConfig;
}

// ============================================================================
// Validation Functions
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate a timesheet against tenant rules
 */
export async function validateTimesheet(
  tenantId: string,
  timesheet: {
    startTime: Date;
    endTime: Date;
    breakMinutes: number;
    description?: string;
    hasLocation?: boolean;
    userId: string;
  }
): Promise<ValidationResult> {
  const rules = await getTenantApprovalRules(tenantId);
  const errors: string[] = [];
  const warnings: string[] = [];

  const startTime = new Date(timesheet.startTime);
  const endTime = new Date(timesheet.endTime);
  const totalHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  const totalMinutes = totalHours * 60;

  // Check max hours per day
  if (totalHours > rules.timesheet.maxHoursPerDay) {
    errors.push(
      `Werktijd (${totalHours.toFixed(1)} uur) overschrijdt maximum van ${rules.timesheet.maxHoursPerDay} uur per dag`
    );
  }

  // Check break requirements
  if (totalHours >= rules.timesheet.breakRequiredAfterHours) {
    if (timesheet.breakMinutes < rules.timesheet.minBreakMinutes) {
      errors.push(
        `Pauze (${timesheet.breakMinutes} min) is minder dan vereist (${rules.timesheet.minBreakMinutes} min) voor shifts langer dan ${rules.timesheet.breakRequiredAfterHours} uur`
      );
    }
  }

  // Check required fields
  if (rules.timesheet.requireDescription && !timesheet.description?.trim()) {
    errors.push('Omschrijving is verplicht');
  }

  if (rules.timesheet.requireLocation && !timesheet.hasLocation) {
    errors.push('GPS-locatie is verplicht');
  }

  // Warnings for long shifts
  if (totalHours > 10) {
    warnings.push('Lange dienst: overweeg extra pauze');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate a vacation request against tenant rules
 */
export async function validateVacationRequest(
  tenantId: string,
  request: {
    startDate: Date;
    endDate: Date;
    totalDays: number;
    userId: string;
  }
): Promise<ValidationResult> {
  const rules = await getTenantApprovalRules(tenantId);
  const errors: string[] = [];
  const warnings: string[] = [];

  const startDate = new Date(request.startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInAdvance = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // Check advance notice
  if (daysInAdvance < rules.vacation.minAdvanceNoticeDays) {
    errors.push(
      `Aanvraag moet minimaal ${rules.vacation.minAdvanceNoticeDays} dagen van tevoren worden ingediend`
    );
  }

  // Check max consecutive days
  if (request.totalDays > rules.vacation.maxConsecutiveDays) {
    errors.push(
      `Maximum ${rules.vacation.maxConsecutiveDays} opeenvolgende dagen vakantie toegestaan`
    );
  }

  // Check blackout dates
  const requestDateStr = startDate.toISOString().split('T')[0];
  if (rules.vacation.blackoutDates.includes(requestDateStr)) {
    errors.push('Vakantie niet toegestaan op deze datum (geblokkeerde periode)');
  }

  // Warnings
  if (request.totalDays > 10) {
    warnings.push('Lange vakantieperiode: goedkeuring kan langer duren');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Check if a timesheet qualifies for auto-approval
 */
export async function checkAutoApproval(
  tenantId: string,
  timesheet: {
    startTime: Date;
    endTime: Date;
    breakMinutes: number;
    description?: string;
  }
): Promise<{ autoApprove: boolean; reason?: string }> {
  const rules = await getTenantApprovalRules(tenantId);

  if (!rules.timesheet.autoApproveEnabled) {
    return { autoApprove: false, reason: 'Auto-goedkeuring uitgeschakeld' };
  }

  const startTime = new Date(timesheet.startTime);
  const endTime = new Date(timesheet.endTime);
  const totalHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

  // Check if under max hours
  if (totalHours > rules.timesheet.autoApproveMaxHours) {
    return {
      autoApprove: false,
      reason: `Uren (${totalHours.toFixed(1)}) overschrijden auto-goedkeuring limiet (${rules.timesheet.autoApproveMaxHours})`,
    };
  }

  // Check weekend rule
  const isWeekend = startTime.getDay() === 0 || startTime.getDay() === 6;
  if (isWeekend && !rules.timesheet.autoApproveOnWeekends) {
    return { autoApprove: false, reason: 'Weekend werk vereist handmatige goedkeuring' };
  }

  // Validate against rules first
  const validation = await validateTimesheet(tenantId, {
    startTime,
    endTime,
    breakMinutes: timesheet.breakMinutes,
    description: timesheet.description,
    userId: '',
  });

  if (!validation.valid) {
    return { autoApprove: false, reason: 'Validatie fouten: ' + validation.errors.join(', ') };
  }

  return { autoApprove: true };
}

/**
 * Check if user has permission to approve based on rules
 */
export async function canUserApprove(
  tenantId: string,
  userRole: UserRole,
  targetUserId?: string,
  currentUserId?: string
): Promise<{ canApprove: boolean; reason?: string }> {
  const rules = await getTenantApprovalRules(tenantId);

  // Check self-approval
  if (targetUserId && currentUserId && targetUserId === currentUserId) {
    if (!rules.timesheet.allowSelfApproval) {
      return { canApprove: false, reason: 'Eigen tijdregistraties goedkeuren is niet toegestaan' };
    }
  }

  // Check role permission
  if (!rules.timesheet.approvalRoles.includes(userRole)) {
    return {
      canApprove: false,
      reason: `Rol ${userRole} heeft geen goedkeuringsrechten`,
    };
  }

  return { canApprove: true };
}
