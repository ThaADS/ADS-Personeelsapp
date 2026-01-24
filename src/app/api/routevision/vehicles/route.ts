import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getTenantContext } from "@/lib/auth/tenant-access";
import {
  login,
  getVehicles,
  decryptCredential,
} from "@/lib/services/routevision-service";
import { createLogger } from "@/lib/logger";

const logger = createLogger("api-routevision-vehicles");

/**
 * GET /api/routevision/vehicles
 * Get all vehicles from RouteVision for the current tenant
 */
export async function GET() {
  try {
    const context = await getTenantContext();
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can access vehicles
    if (context.userRole !== "TENANT_ADMIN" && context.userRole !== "SUPERUSER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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

    // Get vehicles from RouteVision
    const routeVisionVehicles = await getVehicles(token);

    // Get existing mappings
    const mappings = await prisma.vehicleMapping.findMany({
      where: { tenant_id: context.tenantId },
      include: {
        employee: {
          include: {
            users: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    const mappingsMap = new Map(
      mappings.map((m) => [m.provider_vehicle_id || m.routevision_id, m])
    );

    // Merge vehicles with mappings
    const vehicles = routeVisionVehicles.map((v) => {
      const mapping = mappingsMap.get(v.id);
      return {
        id: v.id,
        registration: v.registration,
        name: v.name || null,
        brand: v.brand || null,
        model: v.model || null,
        isActive: v.isActive ?? true,
        mapping: mapping
          ? {
              id: mapping.id,
              employeeId: mapping.employee_id,
              employeeName: mapping.employee?.users?.name || null,
              isActive: mapping.is_active,
            }
          : null,
      };
    });

    return NextResponse.json({ vehicles });
  } catch (error) {
    logger.error("Failed to get vehicles", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get vehicles" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/routevision/vehicles
 * Create or update vehicle mapping
 */
export async function POST(request: NextRequest) {
  try {
    const context = await getTenantContext();
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can modify vehicle mappings
    if (context.userRole !== "TENANT_ADMIN" && context.userRole !== "SUPERUSER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { vehicleId, registration, employeeId, vehicleName, isActive } = body;

    if (!vehicleId || !registration) {
      return NextResponse.json(
        { error: "Vehicle ID and registration are required" },
        { status: 400 }
      );
    }

    // Upsert mapping using new composite unique key
    const mapping = await prisma.vehicleMapping.upsert({
      where: {
        tenant_id_provider_type_provider_vehicle_id: {
          tenant_id: context.tenantId,
          provider_type: 'routevision',
          provider_vehicle_id: vehicleId,
        },
      },
      update: {
        employee_id: employeeId || null,
        vehicle_name: vehicleName || null,
        is_active: isActive ?? true,
      },
      create: {
        tenant_id: context.tenantId,
        provider_type: 'routevision',
        provider_vehicle_id: vehicleId,
        routevision_id: vehicleId, // Legacy compatibility
        registration,
        employee_id: employeeId || null,
        vehicle_name: vehicleName || null,
        is_active: isActive ?? true,
      },
      include: {
        employee: {
          include: {
            users: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      mapping: {
        id: mapping.id,
        vehicleId: mapping.provider_vehicle_id,
        registration: mapping.registration,
        employeeId: mapping.employee_id,
        employeeName: mapping.employee?.users?.name || null,
        isActive: mapping.is_active,
      },
    });
  } catch (error) {
    logger.error("Failed to save vehicle mapping", error);
    return NextResponse.json(
      { error: "Failed to save vehicle mapping" },
      { status: 500 }
    );
  }
}
