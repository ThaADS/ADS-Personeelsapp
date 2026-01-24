import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getTenantContext } from "@/lib/auth/tenant-access";
import {
  login,
  getVehicles,
  getTrips,
  decryptCredential,
  convertTripToDbFormat,
} from "@/lib/services/routevision-service";
import { matchTripsToTimesheets } from "@/lib/services/trip-timesheet-matcher";
import { createLogger } from "@/lib/logger";

const logger = createLogger("api-routevision-sync");

/**
 * POST /api/routevision/sync
 * Manually trigger a sync of RouteVision trips for the current tenant
 */
export async function POST(request: NextRequest) {
  try {
    const context = await getTenantContext();
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can trigger sync
    if (context.userRole !== "TENANT_ADMIN" && context.userRole !== "SUPERUSER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get optional date range from body
    const body = await request.json().catch(() => ({}));
    const daysBack = body.daysBack || 7;

    // Calculate date range
    const dateTo = new Date();
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - daysBack);

    // Get RouteVision config
    const config = await prisma.routeVisionConfig.findUnique({
      where: { tenant_id: context.tenantId },
    });

    if (!config) {
      return NextResponse.json(
        { error: "RouteVision is niet geconfigureerd" },
        { status: 400 }
      );
    }

    // Get token
    const email = decryptCredential(config.api_email);
    const password = decryptCredential(config.api_password);
    const token = await login(email, password);

    // Get vehicle mappings for employee association
    const mappings = await prisma.vehicleMapping.findMany({
      where: {
        tenant_id: context.tenantId,
        is_active: true,
      },
    });

    const vehicleToEmployee = new Map(
      mappings.map((m) => [m.provider_vehicle_id || m.routevision_id, m.employee_id])
    );

    // Get all vehicles
    const vehicles = await getVehicles(token);

    let syncedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    // Process each vehicle
    for (const vehicle of vehicles) {
      try {
        const trips = await getTrips(token, vehicle.id, dateFrom, dateTo);

        for (const trip of trips) {
          // Skip running trips
          if (trip.isRunning) {
            skippedCount++;
            continue;
          }

          // Get employee ID from mapping
          const employeeId = vehicleToEmployee.get(vehicle.id) || null;

          // Convert to DB format
          const tripData = convertTripToDbFormat(trip, context.tenantId, vehicle.id, employeeId || undefined);

          // Upsert trip using new composite unique key
          await prisma.tripRecord.upsert({
            where: {
              tenant_id_provider_type_provider_trip_id: {
                tenant_id: context.tenantId,
                provider_type: 'routevision',
                provider_trip_id: trip.id,
              },
            },
            update: {
              ...tripData,
              synced_at: new Date(),
            },
            create: {
              ...tripData,
              synced_at: new Date(),
            },
          });

          syncedCount++;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        errors.push(`Voertuig ${vehicle.registration}: ${message}`);
      }
    }

    // Update last sync timestamp
    await prisma.routeVisionConfig.update({
      where: { tenant_id: context.tenantId },
      data: { last_sync: new Date() },
    });

    // Auto-match trips to timesheets
    const autoMatch = body.autoMatch !== false; // Default to true
    let matchingResult = null;

    if (autoMatch && syncedCount > 0) {
      try {
        matchingResult = await matchTripsToTimesheets(context.tenantId, {
          dateFrom,
          dateTo,
        });
      } catch (matchError) {
        logger.error("Failed to auto-match trips", matchError);
        errors.push(
          `Auto-match fout: ${matchError instanceof Error ? matchError.message : "Unknown"}`
        );
      }
    }

    return NextResponse.json({
      success: true,
      synced: syncedCount,
      skipped: skippedCount,
      errors: errors.length > 0 ? errors : undefined,
      dateRange: {
        from: dateFrom.toISOString(),
        to: dateTo.toISOString(),
      },
      matching: matchingResult
        ? {
            totalTrips: matchingResult.totalTrips,
            matched: matchingResult.matched,
            unmatched: matchingResult.unmatched,
          }
        : undefined,
    });
  } catch (error) {
    logger.error("Failed to sync RouteVision trips", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sync failed" },
      { status: 500 }
    );
  }
}
