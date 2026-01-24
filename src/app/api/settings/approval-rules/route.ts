import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { getTenantContext } from '@/lib/auth/tenant-access';
import {
  getTenantApprovalRules,
  updateTenantApprovalRules,
  resetTenantApprovalRules,
  defaultApprovalConfig,
  type TenantApprovalConfig,
} from '@/lib/services/approval-rules-service';
import { z } from 'zod';
import { UserRole } from '@/types';

const updateRulesSchema = z.object({
  timesheet: z.object({
    maxHoursPerDay: z.number().min(1).max(24).optional(),
    minBreakMinutes: z.number().min(0).max(120).optional(),
    breakRequiredAfterHours: z.number().min(1).max(12).optional(),
    maxOvertimeHoursPerWeek: z.number().min(0).max(40).optional(),
    autoApproveEnabled: z.boolean().optional(),
    autoApproveMaxHours: z.number().min(1).max(12).optional(),
    autoApproveOnWeekends: z.boolean().optional(),
    requireDescription: z.boolean().optional(),
    requireLocation: z.boolean().optional(),
    allowSelfApproval: z.boolean().optional(),
    approvalRoles: z.array(z.nativeEnum(UserRole)).optional(),
  }).optional(),
  vacation: z.object({
    minAdvanceNoticeDays: z.number().min(0).max(90).optional(),
    maxConsecutiveDays: z.number().min(1).max(60).optional(),
    maxDaysPerMonth: z.number().min(1).max(31).optional(),
    blackoutDates: z.array(z.string()).optional(),
    autoApproveEnabled: z.boolean().optional(),
    autoApproveMaxDays: z.number().min(1).max(5).optional(),
    allowOverlapWithTeamMembers: z.boolean().optional(),
    maxTeamMembersOnVacation: z.number().min(1).max(20).optional(),
    approvalRoles: z.array(z.nativeEnum(UserRole)).optional(),
  }).optional(),
  sickLeave: z.object({
    requireMedicalCertificateAfterDays: z.number().min(1).max(14).optional(),
    uwvReportDeadlineDays: z.number().min(1).max(90).optional(),
    requireReasonForShortAbsence: z.boolean().optional(),
    shortAbsenceMaxDays: z.number().min(1).max(5).optional(),
    requireReturnConfirmation: z.boolean().optional(),
    partialWorkAllowed: z.boolean().optional(),
  }).optional(),
});

/**
 * GET /api/settings/approval-rules - Get tenant approval rules
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const context = await getTenantContext();
    if (!context) {
      return NextResponse.json({ error: 'No tenant context' }, { status: 403 });
    }

    // Only TENANT_ADMIN and MANAGER can view rules
    if (!['TENANT_ADMIN', 'MANAGER'].includes(context.userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const rules = await getTenantApprovalRules(context.tenantId);

    return NextResponse.json({
      tenantId: context.tenantId,
      rules,
      defaults: defaultApprovalConfig,
      canEdit: context.userRole === 'TENANT_ADMIN',
    });
  } catch (error) {
    console.error('Error fetching approval rules:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/settings/approval-rules - Update tenant approval rules
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const context = await getTenantContext();
    if (!context) {
      return NextResponse.json({ error: 'No tenant context' }, { status: 403 });
    }

    // Only TENANT_ADMIN can update rules
    if (context.userRole !== 'TENANT_ADMIN') {
      return NextResponse.json({ error: 'Only tenant administrators can update rules' }, { status: 403 });
    }

    const body = await request.json();
    const validatedRules = updateRulesSchema.parse(body);

    const updatedRules = await updateTenantApprovalRules(
      context.tenantId,
      validatedRules as Partial<TenantApprovalConfig>,
      context.userId
    );

    return NextResponse.json({
      success: true,
      message: 'Goedkeuringsregels bijgewerkt',
      rules: updatedRules,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating approval rules:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/settings/approval-rules - Reset to default rules
 */
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const context = await getTenantContext();
    if (!context) {
      return NextResponse.json({ error: 'No tenant context' }, { status: 403 });
    }

    // Only TENANT_ADMIN can reset rules
    if (context.userRole !== 'TENANT_ADMIN') {
      return NextResponse.json({ error: 'Only tenant administrators can reset rules' }, { status: 403 });
    }

    const rules = await resetTenantApprovalRules(context.tenantId, context.userId);

    return NextResponse.json({
      success: true,
      message: 'Goedkeuringsregels teruggezet naar standaard',
      rules,
    });
  } catch (error) {
    console.error('Error resetting approval rules:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
