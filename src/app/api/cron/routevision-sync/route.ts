import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  login,
  getVehicles,
  getTrips,
  decryptCredential,
  convertTripToDbFormat,
} from "@/lib/services/routevision-service";
import { matchTripsToTimesheets } from "@/lib/services/trip-timesheet-matcher";

/**
 * GET /api/cron/routevision-sync
 * Cron job to sync RouteVision trips for all tenants with sync enabled
 *
 * Vercel Cron Configuration (add to vercel.json):
 * {
 *   "crons": [
 *     {
 *       "path": "/api/cron/routevision-sync",
 *       "schedule": "0 6 * * *"
 *     }
 *   ]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all tenants with RouteVision sync enabled
    const configs = await prisma.routeVisionConfig.findMany({
      where: { sync_enabled: true },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (configs.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No tenants with sync enabled",
        tenantsProcessed: 0,
      });
    }

    // Calculate date range (last 24 hours plus buffer)
    const dateTo = new Date();
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - 2); // 2 days back to ensure no gaps

    const results: {
      tenantId: string;
      tenantName: string;
      synced: number;
      matched: number;
      errors: string[];
    }[] = [];

    // Process each tenant
    for (const config of configs) {
      const tenantResult = {
        tenantId: config.tenant_id,
        tenantName: config.tenant.name,
        synced: 0,
        matched: 0,
        errors: [] as string[],
      };

      try {
        // Get token
        const email = decryptCredential(config.api_email);
        const password = decryptCredential(config.api_password);
        const token = await login(email, password);

        // Get vehicle mappings
        const mappings = await prisma.vehicleMapping.findMany({
          where: {
            tenant_id: config.tenant_id,
            is_active: true,
          },
        });

        const vehicleToEmployee = new Map(
          mappings.map((m) => [m.provider_vehicle_id || m.routevision_id, m.employee_id])
        );

        // Get all vehicles
        const vehicles = await getVehicles(token);

        // Process each vehicle
        for (const vehicle of vehicles) {
          try {
            const trips = await getTrips(token, vehicle.id, dateFrom, dateTo);

            for (const trip of trips) {
              // Skip running trips
              if (trip.isRunning) continue;

              // Get employee ID from mapping
              const employeeId = vehicleToEmployee.get(vehicle.id) || null;

              // Convert to DB format
              const tripData = convertTripToDbFormat(
                trip,
                config.tenant_id,
                vehicle.id,
                employeeId || undefined
              );

              // Upsert trip using new composite unique key
              await prisma.tripRecord.upsert({
                where: {
                  tenant_id_provider_type_provider_trip_id: {
                    tenant_id: config.tenant_id,
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

              tenantResult.synced++;
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            tenantResult.errors.push(`Vehicle ${vehicle.registration}: ${message}`);
          }
        }

        // Update last sync timestamp
        await prisma.routeVisionConfig.update({
          where: { tenant_id: config.tenant_id },
          data: { last_sync: new Date() },
        });

        // Auto-match trips to timesheets
        if (tenantResult.synced > 0) {
          try {
            const matchResult = await matchTripsToTimesheets(config.tenant_id, {
              dateFrom,
              dateTo,
            });
            tenantResult.matched = matchResult.matched;
          } catch (matchError) {
            const matchMessage =
              matchError instanceof Error ? matchError.message : "Unknown error";
            tenantResult.errors.push(`Auto-match failed: ${matchMessage}`);
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        tenantResult.errors.push(`Tenant sync failed: ${message}`);
      }

      results.push(tenantResult);
    }

    // Calculate totals
    const totalSynced = results.reduce((sum, r) => sum + r.synced, 0);
    const totalMatched = results.reduce((sum, r) => sum + r.matched, 0);
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);

    return NextResponse.json({
      success: true,
      tenantsProcessed: configs.length,
      totalTrips: totalSynced,
      totalMatched,
      totalErrors,
      results,
      dateRange: {
        from: dateFrom.toISOString(),
        to: dateTo.toISOString(),
      },
    });
  } catch (error) {
    console.error("RouteVision cron sync error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Cron sync failed" },
      { status: 500 }
    );
  }
}
