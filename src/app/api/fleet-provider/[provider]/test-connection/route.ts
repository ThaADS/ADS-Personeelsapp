import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getTenantContext } from '@/lib/auth/tenant-access';
import { FleetProviderType, FLEET_PROVIDERS } from '@/lib/services/fleet-providers/types';
import { createFleetProvider } from '@/lib/services/fleet-providers';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.FLEET_ENCRYPTION_KEY || 'default-key-change-in-production!';

function decrypt(text: string): string {
  try {
    const parts = text.split(':');
    if (parts.length !== 2) return text;
    const iv = Buffer.from(parts[0], 'hex');
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(parts[1], 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return text;
  }
}

/**
 * POST /api/fleet-provider/[provider]/test-connection
 * Test connection to a fleet provider
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const context = await getTenantContext();
    if (!context) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { provider } = await params;
    const providerType = provider as FleetProviderType;

    if (!FLEET_PROVIDERS[providerType]) {
      return NextResponse.json({ error: 'Unknown provider' }, { status: 400 });
    }

    const body = await request.json();

    // Get existing config for fallback credentials
    const existingConfig = await prisma.fleetProviderConfig.findUnique({
      where: {
        tenant_id_provider_type: {
          tenant_id: context.tenantId,
          provider_type: providerType,
        },
      },
    });

    const existingCredentials = (existingConfig?.credentials as Record<string, string>) || {};

    // Build credentials for test
    const credentials = {
      providerType,
      email: body.email || existingCredentials.email,
      password: body.password || (existingCredentials.password ? decrypt(existingCredentials.password) : undefined),
      apiKey: body.apiKey || (existingCredentials.apiKey ? decrypt(existingCredentials.apiKey) : undefined),
      apiSecret: body.apiSecret || (existingCredentials.apiSecret ? decrypt(existingCredentials.apiSecret) : undefined),
      customFields: {
        accountId: body.accountId || existingCredentials.accountId,
      },
    };

    // Create provider instance and test connection
    const providerInstance = createFleetProvider(providerType);
    const result = await providerInstance.testConnection(credentials);

    // Update connection status in database
    if (existingConfig) {
      await prisma.fleetProviderConfig.update({
        where: { id: existingConfig.id },
        data: {
          connection_status: result.success ? 'connected' : 'error',
          updated_at: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: result.success,
      vehicleCount: result.vehicleCount,
      error: result.error,
      providerVersion: result.providerVersion,
    });
  } catch (error) {
    console.error('Fleet provider test connection error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed',
      },
      { status: 500 }
    );
  }
}
