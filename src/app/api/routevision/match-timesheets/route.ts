import { NextRequest, NextResponse } from "next/server";
import { getTenantContext } from "@/lib/auth/tenant-access";
import {
  matchTripsToTimesheets,
  getMatchingStats,
  clearTimesheetMatches,
} from "@/lib/services/trip-timesheet-matcher";

/**
 * GET /api/routevision/match-timesheets
 * Get matching statistics for the current tenant
 */
export async function GET(request: NextRequest) {
  try {
    const context = await getTenantContext();
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get date range from query params
    const { searchParams } = new URL(request.url);
    const dateFromParam = searchParams.get("dateFrom");
    const dateToParam = searchParams.get("dateTo");

    const options: { dateFrom?: Date; dateTo?: Date } = {};

    if (dateFromParam) {
      options.dateFrom = new Date(dateFromParam);
    }

    if (dateToParam) {
      options.dateTo = new Date(dateToParam);
    }

    const stats = await getMatchingStats(context.tenantId, options);

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error getting matching stats:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get stats" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/routevision/match-timesheets
 * Trigger automatic matching of trips to timesheets
 */
export async function POST(request: NextRequest) {
  try {
    const context = await getTenantContext();
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can trigger matching
    if (context.userRole !== "TENANT_ADMIN" && context.userRole !== "SUPERUSER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get options from request body
    const body = await request.json().catch(() => ({}));
    const forceRematch = body.forceRematch === true;
    const dateFromParam = body.dateFrom;
    const dateToParam = body.dateTo;

    const options: {
      forceRematch?: boolean;
      dateFrom?: Date;
      dateTo?: Date;
    } = {
      forceRematch,
    };

    if (dateFromParam) {
      options.dateFrom = new Date(dateFromParam);
    }

    if (dateToParam) {
      options.dateTo = new Date(dateToParam);
    }

    const result = await matchTripsToTimesheets(context.tenantId, options);

    return NextResponse.json({
      success: true,
      totalTrips: result.totalTrips,
      matched: result.matched,
      unmatched: result.unmatched,
      matchRate:
        result.totalTrips > 0
          ? Math.round((result.matched / result.totalTrips) * 1000) / 10
          : 0,
      details: result.results.slice(0, 20), // Limit detailed results
    });
  } catch (error) {
    console.error("Error matching trips to timesheets:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Matching failed" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/routevision/match-timesheets
 * Clear timesheet matches for re-matching
 */
export async function DELETE(request: NextRequest) {
  try {
    const context = await getTenantContext();
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can clear matches
    if (context.userRole !== "TENANT_ADMIN" && context.userRole !== "SUPERUSER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get options from query params
    const { searchParams } = new URL(request.url);
    const dateFromParam = searchParams.get("dateFrom");
    const dateToParam = searchParams.get("dateTo");

    const options: { dateFrom?: Date; dateTo?: Date } = {};

    if (dateFromParam) {
      options.dateFrom = new Date(dateFromParam);
    }

    if (dateToParam) {
      options.dateTo = new Date(dateToParam);
    }

    const clearedCount = await clearTimesheetMatches(context.tenantId, options);

    return NextResponse.json({
      success: true,
      cleared: clearedCount,
    });
  } catch (error) {
    console.error("Error clearing timesheet matches:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Clear failed" },
      { status: 500 }
    );
  }
}
