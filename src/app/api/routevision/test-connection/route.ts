import { NextRequest, NextResponse } from "next/server";
import { getTenantContext } from "@/lib/auth/tenant-access";
import { testConnection } from "@/lib/services/routevision-service";

/**
 * POST /api/routevision/test-connection
 * Test connection to RouteVision API with provided credentials
 */
export async function POST(request: NextRequest) {
  try {
    const context = await getTenantContext();
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can test RouteVision connection
    if (context.userRole !== "TENANT_ADMIN" && context.userRole !== "SUPERUSER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const result = await testConnection(email, password);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Verbinding succesvol! ${result.vehicleCount} voertuig(en) gevonden.`,
        vehicleCount: result.vehicleCount,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: result.error || "Verbinding mislukt",
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Error testing RouteVision connection:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Verbinding mislukt",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
