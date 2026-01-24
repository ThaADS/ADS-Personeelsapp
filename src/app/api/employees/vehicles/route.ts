/**
 * API route voor voertuigen beschikbaar voor werknemers
 */
import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/auth/tenant-access";
import { prisma } from "@/lib/db/prisma";
import { createLogger } from "@/lib/logger";

const logger = createLogger("api-employees-vehicles");

/**
 * GET /api/employees/vehicles
 * Haalt alle voertuig mappings op voor de huidige tenant
 * Dit zijn voertuigen die gekoppeld kunnen worden aan werknemers
 */
export async function GET() {
  try {
    const context = await getTenantContext();
    if (!context) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    // Haal alle voertuig mappings op met huidige employee koppeling
    const vehicles = await prisma.vehicleMapping.findMany({
      where: {
        tenant_id: context.tenantId,
        is_active: true,
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
      orderBy: {
        registration: "asc",
      },
    });

    // Transformeer naar response formaat
    const formattedVehicles = vehicles.map((v) => ({
      id: v.id,
      providerType: v.provider_type,
      providerVehicleId: v.provider_vehicle_id,
      registration: v.registration,
      vehicleName: v.vehicle_name,
      isActive: v.is_active,
      employeeId: v.employee_id,
      employeeName: v.employee?.users?.name || null,
    }));

    return NextResponse.json({ vehicles: formattedVehicles });
  } catch (error) {
    logger.error("Error getting vehicles for employees", error);
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 });
  }
}
