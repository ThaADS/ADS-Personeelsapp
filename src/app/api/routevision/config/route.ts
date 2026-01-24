import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getTenantContext } from "@/lib/auth/tenant-access";
import {
  encryptCredential,
  decryptCredential,
  testConnection,
} from "@/lib/services/routevision-service";
import { createLogger } from "@/lib/logger";

const logger = createLogger("api-routevision-config");

/**
 * GET /api/routevision/config
 * Get RouteVision configuration for the current tenant
 */
export async function GET() {
  try {
    const context = await getTenantContext();
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can access RouteVision config
    if (context.userRole !== "TENANT_ADMIN" && context.userRole !== "SUPERUSER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const config = await prisma.routeVisionConfig.findUnique({
      where: { tenant_id: context.tenantId },
    });

    if (!config) {
      return NextResponse.json({
        configured: false,
        api_email: null,
        sync_enabled: false,
        sync_interval: 60,
        last_sync: null,
      });
    }

    return NextResponse.json({
      configured: true,
      api_email: decryptCredential(config.api_email),
      sync_enabled: config.sync_enabled,
      sync_interval: config.sync_interval,
      last_sync: config.last_sync,
    });
  } catch (error) {
    logger.error("Failed to get RouteVision config", error);
    return NextResponse.json(
      { error: "Failed to get configuration" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/routevision/config
 * Create or update RouteVision configuration for the current tenant
 */
export async function POST(request: NextRequest) {
  try {
    const context = await getTenantContext();
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can modify RouteVision config
    if (context.userRole !== "TENANT_ADMIN" && context.userRole !== "SUPERUSER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { api_email, api_password, sync_enabled, sync_interval } = body;

    // Validate required fields
    if (!api_email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // If password is provided, encrypt it
    const encryptedEmail = encryptCredential(api_email);
    const encryptedPassword = api_password
      ? encryptCredential(api_password)
      : undefined;

    // Upsert configuration
    const config = await prisma.routeVisionConfig.upsert({
      where: { tenant_id: context.tenantId },
      update: {
        api_email: encryptedEmail,
        ...(encryptedPassword && { api_password: encryptedPassword }),
        sync_enabled: sync_enabled ?? false,
        sync_interval: sync_interval ?? 60,
      },
      create: {
        tenant_id: context.tenantId,
        api_email: encryptedEmail,
        api_password: encryptedPassword || "",
        sync_enabled: sync_enabled ?? false,
        sync_interval: sync_interval ?? 60,
      },
    });

    return NextResponse.json({
      success: true,
      configured: true,
      api_email: api_email,
      sync_enabled: config.sync_enabled,
      sync_interval: config.sync_interval,
      last_sync: config.last_sync,
    });
  } catch (error) {
    logger.error("Failed to save RouteVision config", error);
    return NextResponse.json(
      { error: "Failed to save configuration" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/routevision/config
 * Remove RouteVision configuration for the current tenant
 */
export async function DELETE() {
  try {
    const context = await getTenantContext();
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can delete RouteVision config
    if (context.userRole !== "TENANT_ADMIN" && context.userRole !== "SUPERUSER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.routeVisionConfig.delete({
      where: { tenant_id: context.tenantId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Failed to delete RouteVision config", error);
    return NextResponse.json(
      { error: "Failed to delete configuration" },
      { status: 500 }
    );
  }
}
