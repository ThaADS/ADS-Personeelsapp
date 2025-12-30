import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getTenantContext } from "@/lib/auth/tenant-access";

/**
 * GET /api/routevision/trips
 * Get synced trips for the current tenant
 */
export async function GET(request: NextRequest) {
  try {
    const context = await getTenantContext();
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const employeeId = searchParams.get("employeeId");
    const vehicleId = searchParams.get("vehicleId");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const includePrivate = searchParams.get("includePrivate") === "true";

    // Build where clause
    const where: Record<string, unknown> = {
      tenant_id: context.tenantId,
    };

    // Filter by employee
    if (employeeId) {
      where.employee_id = employeeId;
    } else if (context.userRole === "USER") {
      // Regular users can only see their own trips
      const employee = await prisma.employees.findFirst({
        where: {
          user_id: context.userId,
          tenant_id: context.tenantId,
        },
      });
      if (employee) {
        where.employee_id = employee.id;
      } else {
        // User has no employee record, return empty
        return NextResponse.json({
          trips: [],
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0,
          },
        });
      }
    }

    // Filter by vehicle
    if (vehicleId) {
      where.vehicle_id = vehicleId;
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      where.departure_time = {};
      if (dateFrom) {
        (where.departure_time as Record<string, Date>).gte = new Date(dateFrom);
      }
      if (dateTo) {
        (where.departure_time as Record<string, Date>).lte = new Date(dateTo);
      }
    }

    // Filter out private trips unless requested
    if (!includePrivate && context.userRole !== "TENANT_ADMIN" && context.userRole !== "SUPERUSER") {
      where.is_private = false;
    }

    // Get total count
    const total = await prisma.tripRecord.count({ where });

    // Get trips with pagination
    const trips = await prisma.tripRecord.findMany({
      where,
      orderBy: { departure_time: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Format response
    const formattedTrips = trips.map((trip) => ({
      id: trip.id,
      vehicleId: trip.vehicle_id,
      registration: trip.registration,
      driverName: trip.driver_name,
      employeeId: trip.employee_id,

      departureTime: trip.departure_time,
      arrivalTime: trip.arrival_time,
      distanceKm: trip.distance_km,
      durationMinutes: trip.duration_minutes,

      departureAddress: trip.departure_address,
      arrivalAddress: trip.arrival_address,

      isPrivate: trip.is_private,
      isCommute: trip.is_commute,
      isManual: trip.is_manual,
      isCorrection: trip.is_correction,

      timesheetId: trip.timesheet_id,
      syncedAt: trip.synced_at,
    }));

    return NextResponse.json({
      trips: formattedTrips,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error getting trips:", error);
    return NextResponse.json(
      { error: "Failed to get trips" },
      { status: 500 }
    );
  }
}
