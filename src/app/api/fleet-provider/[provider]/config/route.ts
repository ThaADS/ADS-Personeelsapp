import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getTenantContext } from '@/lib/auth/tenant-access';
import { FleetProviderType, FLEET_PROVIDERS } from '@/lib/services/fleet-providers/types';
import crypto from 'crypto';

// Encryption key from environment (should be 32 bytes for AES-256)
const ENCRYPTION_KEY = process.env.FLEET_ENCRYPTION_KEY || 'default-key-change-in-production!';

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

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
 * GET /api/fleet-provider/[provider]/config
 * Get configuration for a specific fleet provider
 */
export async function GET(
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

    const config = await prisma.fleetProviderConfig.findUnique({
      where: {
        tenant_id_provider_type: {
          tenant_id: context.tenantId,
          provider_type: providerType,
        },
      },
    });

    if (!config) {
      return NextResponse.json({
        provider_type: providerType,
        credentials: {},
        sync_enabled: false,
        connection_status: 'unconfigured',
        last_sync: null,
        vehicle_count: 0,
      });
    }

    // Decrypt and mask sensitive credentials
    const credentials = config.credentials as Record<string, string>;
    const maskedCredentials: Record<string, string> = {};

    if (credentials.email) {
      maskedCredentials.email = credentials.email; // Email is not encrypted
    }
    if (credentials.apiKey) {
      maskedCredentials.apiKey = '••••••••'; // Mask API key
    }
    if (credentials.accountId) {
      maskedCredentials.accountId = credentials.accountId; // Account ID is not encrypted
    }

    // Count vehicles for this provider
    const vehicleCount = await prisma.vehicleMapping.count({
      where: {
        tenant_id: context.tenantId,
        provider_type: providerType,
      },
    });

    return NextResponse.json({
      id: config.id,
      provider_type: config.provider_type,
      credentials: maskedCredentials,
      sync_enabled: config.sync_enabled,
      connection_status: config.connection_status,
      last_sync: config.last_sync,
      vehicle_count: vehicleCount,
    });
  } catch (error) {
    console.error('Fleet provider config error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get config' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/fleet-provider/[provider]/config
 * Save configuration for a specific fleet provider
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

    // Check admin permission
    if (context.userRole !== 'TENANT_ADMIN' && context.userRole !== 'SUPERUSER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { provider } = await params;
    const providerType = provider as FleetProviderType;

    if (!FLEET_PROVIDERS[providerType]) {
      return NextResponse.json({ error: 'Unknown provider' }, { status: 400 });
    }

    const body = await request.json();
    const { credentials, sync_enabled } = body;

    // Get existing config to preserve credentials if not updated
    const existingConfig = await prisma.fleetProviderConfig.findUnique({
      where: {
        tenant_id_provider_type: {
          tenant_id: context.tenantId,
          provider_type: providerType,
        },
      },
    });

    const existingCredentials = (existingConfig?.credentials as Record<string, string>) || {};

    // Build new credentials, encrypting sensitive fields
    const newCredentials: Record<string, string> = {};

    if (credentials.email) {
      newCredentials.email = credentials.email;
    } else if (existingCredentials.email) {
      newCredentials.email = existingCredentials.email;
    }

    if (credentials.password) {
      newCredentials.password = encrypt(credentials.password);
    } else if (existingCredentials.password) {
      newCredentials.password = existingCredentials.password;
    }

    if (credentials.apiKey && !credentials.apiKey.startsWith('••')) {
      newCredentials.apiKey = encrypt(credentials.apiKey);
    } else if (existingCredentials.apiKey) {
      newCredentials.apiKey = existingCredentials.apiKey;
    }

    if (credentials.apiSecret) {
      newCredentials.apiSecret = encrypt(credentials.apiSecret);
    } else if (existingCredentials.apiSecret) {
      newCredentials.apiSecret = existingCredentials.apiSecret;
    }

    if (credentials.accountId) {
      newCredentials.accountId = credentials.accountId;
    } else if (existingCredentials.accountId) {
      newCredentials.accountId = existingCredentials.accountId;
    }

    // Upsert config
    const config = await prisma.fleetProviderConfig.upsert({
      where: {
        tenant_id_provider_type: {
          tenant_id: context.tenantId,
          provider_type: providerType,
        },
      },
      update: {
        credentials: newCredentials,
        sync_enabled: sync_enabled ?? existingConfig?.sync_enabled ?? false,
        updated_at: new Date(),
      },
      create: {
        tenant_id: context.tenantId,
        provider_type: providerType,
        credentials: newCredentials,
        sync_enabled: sync_enabled ?? false,
        connection_status: 'unconfigured',
      },
    });

    return NextResponse.json({
      success: true,
      id: config.id,
      provider_type: config.provider_type,
      sync_enabled: config.sync_enabled,
    });
  } catch (error) {
    console.error('Fleet provider config save error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save config' },
      { status: 500 }
    );
  }
}
