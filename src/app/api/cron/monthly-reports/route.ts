/**
 * Cron Endpoint for Monthly Reports
 *
 * Schedule (configured in vercel.json):
 * - 1st of every month at 08:00 CET: Generate and send monthly reports
 *
 * Security: Protected by CRON_SECRET environment variable
 */

import { NextRequest, NextResponse } from "next/server";
import { processMonthlyReports, buildAndSendMonthlyReport, ReportConfig } from "@/lib/services/report-builder";
import { verifyCronAuth } from "@/lib/security/cron-auth";
import { createLogger } from "@/lib/logger";

const logger = createLogger("cron-monthly-reports");

// GET - Automatic monthly report generation
export async function GET(request: NextRequest) {
  // Verify authorization - CRON_SECRET is required in production
  const auth = verifyCronAuth(request);
  if (!auth.authorized) {
    return auth.error!;
  }

  try {
    logger.info("Processing monthly reports");
    const result = await processMonthlyReports();

    return NextResponse.json({
      success: result.success,
      reportsGenerated: result.reportsGenerated,
      emailsSent: result.emailsSent,
      errors: result.errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Monthly reports cron failed", error);
    return NextResponse.json(
      {
        success: false,
        error: String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// POST - Manual report generation for specific tenant
export async function POST(request: NextRequest) {
  // Verify authorization - CRON_SECRET is required in production
  const auth = verifyCronAuth(request);
  if (!auth.authorized) {
    return auth.error!;
  }

  try {
    const body = await request.json();

    const config: ReportConfig = {
      tenantId: body.tenantId,
      reportType: body.reportType || "monthly_overview",
      period: {
        month: body.month || new Date().getMonth() || 12,
        year: body.year || (new Date().getMonth() === 0 ? new Date().getFullYear() - 1 : new Date().getFullYear()),
      },
      recipients: {
        to: body.recipients?.to || [],
        cc: body.recipients?.cc || [],
        bcc: body.recipients?.bcc || [],
      },
      includeDetails: body.includeDetails ?? true,
      groupByDepartment: body.groupByDepartment ?? true,
    };

    if (!config.tenantId) {
      return NextResponse.json(
        { error: "tenantId is required" },
        { status: 400 }
      );
    }

    if (config.recipients.to.length === 0) {
      return NextResponse.json(
        { error: "At least one recipient is required" },
        { status: 400 }
      );
    }

    const result = await buildAndSendMonthlyReport(config);

    return NextResponse.json({
      success: result.success,
      emailsSent: result.emailsSent,
      error: result.error,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Manual report generation failed", error);
    return NextResponse.json(
      {
        success: false,
        error: String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
