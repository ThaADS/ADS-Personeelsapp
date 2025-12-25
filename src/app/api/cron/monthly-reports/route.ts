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

// Verify the request is from Vercel Cron
function verifyCronRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");

  // In development, allow requests without auth
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  // In production, verify the cron secret
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.warn("CRON_SECRET not configured");
    return false;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

// GET - Automatic monthly report generation
export async function GET(request: NextRequest) {
  // Verify authorization
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("Processing monthly reports...");
    const result = await processMonthlyReports();

    return NextResponse.json({
      success: result.success,
      reportsGenerated: result.reportsGenerated,
      emailsSent: result.emailsSent,
      errors: result.errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Monthly reports cron error:", error);
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
  // Verify authorization
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    console.error("Manual report generation error:", error);
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
