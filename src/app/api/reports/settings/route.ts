/**
 * Report Settings API
 *
 * Manage report configuration per tenant:
 * - Monthly report recipients (to, cc, bcc)
 * - Report types enabled
 * - Delivery schedule preferences
 * - Report content options
 */

import { NextRequest, NextResponse } from "next/server";
import { getTenantContext } from "@/lib/auth/tenant-access";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Validation schema for report settings
const reportSettingsSchema = z.object({
  monthlyReportEnabled: z.boolean().default(true),
  monthlyReportRecipients: z.object({
    to: z.array(z.string().email()).min(1, "Minimaal 1 ontvanger vereist"),
    cc: z.array(z.string().email()).optional().default([]),
    bcc: z.array(z.string().email()).optional().default([]),
  }),
  monthlyReportOptions: z.object({
    includeDetails: z.boolean().default(true),
    groupByDepartment: z.boolean().default(true),
    includeLeaveBalance: z.boolean().default(true),
    includeSickLeave: z.boolean().default(true),
    includeOvertime: z.boolean().default(true),
    includePendingApprovals: z.boolean().default(true),
  }).optional(),
  weeklyReminderEnabled: z.boolean().default(true),
  weeklyReminderTiming: z.object({
    fridayTime: z.string().regex(/^\d{2}:\d{2}$/).default("15:00"),
    mondayTime: z.string().regex(/^\d{2}:\d{2}$/).default("09:00"),
  }).optional(),
  managerEscalationEnabled: z.boolean().default(true),
});

type ReportSettings = z.infer<typeof reportSettingsSchema>;

// Default settings
const defaultSettings: ReportSettings = {
  monthlyReportEnabled: true,
  monthlyReportRecipients: {
    to: [],
    cc: [],
    bcc: [],
  },
  monthlyReportOptions: {
    includeDetails: true,
    groupByDepartment: true,
    includeLeaveBalance: true,
    includeSickLeave: true,
    includeOvertime: true,
    includePendingApprovals: true,
  },
  weeklyReminderEnabled: true,
  weeklyReminderTiming: {
    fridayTime: "15:00",
    mondayTime: "09:00",
  },
  managerEscalationEnabled: true,
};

// GET - Fetch report settings for current tenant
export async function GET() {
  try {
    const context = await getTenantContext();

    if (!context || !context.tenantId) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    // Only admins and managers can view report settings
    if (!["TENANT_ADMIN", "MANAGER", "SUPERUSER"].includes(context.userRole || "")) {
      return NextResponse.json({ error: "Onvoldoende rechten" }, { status: 403 });
    }

    // Get tenant settings
    const tenant = await prisma.tenant.findUnique({
      where: { id: context.tenantId },
      select: {
        id: true,
        name: true,
        settings: true,
        contactEmail: true,
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant niet gevonden" }, { status: 404 });
    }

    // Extract report settings from tenant settings JSON
    const tenantSettings = (tenant.settings as Record<string, unknown>) || {};
    const reportSettings = (tenantSettings.reportSettings as ReportSettings) || defaultSettings;

    // If no recipients set, default to tenant contact email
    if (!reportSettings.monthlyReportRecipients?.to?.length && tenant.contactEmail) {
      reportSettings.monthlyReportRecipients = {
        ...reportSettings.monthlyReportRecipients,
        to: [tenant.contactEmail],
      };
    }

    // Get available managers for recipient suggestions
    const managers = await prisma.tenantUser.findMany({
      where: {
        tenantId: context.tenantId,
        isActive: true,
        role: {
          in: ["TENANT_ADMIN", "MANAGER"],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      settings: reportSettings,
      availableRecipients: managers.map((m) => ({
        id: m.user.id,
        name: m.user.name || m.user.email,
        email: m.user.email,
        role: m.role,
      })),
      tenantName: tenant.name,
    });
  } catch (error) {
    console.error("Error fetching report settings:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PUT - Update report settings
export async function PUT(request: NextRequest) {
  try {
    const context = await getTenantContext();

    if (!context || !context.tenantId) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    // Only admins can update report settings
    if (!["TENANT_ADMIN", "SUPERUSER"].includes(context.userRole || "")) {
      return NextResponse.json({ error: "Onvoldoende rechten" }, { status: 403 });
    }

    const body = await request.json();
    const validatedSettings = reportSettingsSchema.parse(body);

    // Get current tenant settings
    const tenant = await prisma.tenant.findUnique({
      where: { id: context.tenantId },
      select: {
        settings: true,
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant niet gevonden" }, { status: 404 });
    }

    // Merge with existing settings
    const currentSettings = (tenant.settings as Record<string, unknown>) || {};
    const updatedSettings = {
      ...currentSettings,
      reportSettings: validatedSettings,
    };

    // Update tenant settings
    await prisma.tenant.update({
      where: { id: context.tenantId },
      data: {
        settings: updatedSettings,
      },
    });

    return NextResponse.json({
      success: true,
      settings: validatedSettings,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validatiefout", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating report settings:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST - Trigger manual report generation
export async function POST(request: NextRequest) {
  try {
    const context = await getTenantContext();

    if (!context || !context.tenantId) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    // Only admins can trigger manual reports
    if (!["TENANT_ADMIN", "SUPERUSER"].includes(context.userRole || "")) {
      return NextResponse.json({ error: "Onvoldoende rechten" }, { status: 403 });
    }

    const body = await request.json();
    const { reportType, month, year, recipients } = body;

    // Validate inputs
    if (!reportType) {
      return NextResponse.json({ error: "reportType is required" }, { status: 400 });
    }

    if (!recipients?.to?.length) {
      return NextResponse.json({ error: "At least one recipient required" }, { status: 400 });
    }

    // Import and call report builder
    const { buildAndSendMonthlyReport } = await import("@/lib/services/report-builder");

    const result = await buildAndSendMonthlyReport({
      tenantId: context.tenantId,
      reportType,
      period: {
        month: month || new Date().getMonth() || 12,
        year: year || new Date().getFullYear(),
      },
      recipients: {
        to: recipients.to,
        cc: recipients.cc || [],
        bcc: recipients.bcc || [],
      },
      includeDetails: body.includeDetails ?? true,
      groupByDepartment: body.groupByDepartment ?? true,
    });

    return NextResponse.json({
      success: result.success,
      emailsSent: result.emailsSent,
      error: result.error,
    });
  } catch (error) {
    console.error("Error generating manual report:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
