import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getTenantContext } from '@/lib/auth/tenant-access';
import { FleetProviderType, FLEET_PROVIDERS } from '@/lib/services/fleet-providers/types';
import { createFleetProvider } from '@/lib/services/fleet-providers';
import { matchTripsToTimesheets } from '@/lib/services/trip-timesheet-matcher';
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
 * POST /api/fleet-provider/[provider]/sync
 * Manually sync trips from a fleet provider
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

    // Get config
    const config = await prisma.fleetProviderConfig.findUnique({
      where: {
        tenant_id_provider_type: {
          tenant_id: context.tenantId,
          provider_type: providerType,
        },
      },
    });

    if (!config) {
      return NextResponse.json({ error: 'Provider not configured' }, { status: 400 });
    }

    const credentials = config.credentials as Record<string, string>;

    // Build credentials
    const providerCredentials = {
      providerType,
      email: credentials.email,
      password: credentials.password ? decrypt(credentials.password) : undefined,
      apiKey: credentials.apiKey ? decrypt(credentials.apiKey) : undefined,
      apiSecret: credentials.apiSecret ? decrypt(credentials.apiSecret) : undefined,
      customFields: {
        accountId: credentials.accountId,
      },
    };

    // Create provider instance
    const providerInstance = createFleetProvider(providerType);

    // Authenticate
    const token = await providerInstance.authenticate(providerCredentials);

    // Get vehicles
    const vehicles = await providerInstance.getVehicles(token);

    // Get vehicle mappings
    const mappings = await prisma.vehicleMapping.findMany({
      where: {
        tenant_id: context.tenantId,
        provider_type: providerType,
        is_active: true,
      },
    });

    const vehicleToEmployee = new Map(
      mappings.map((m) => [m.provider_vehicle_id || m.routevision_id, m.employee_id])
    );

    // Sync date range (last 7 days)
    const dateTo = new Date();
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - 7);

    let syncedTrips = 0;
    let syncedVehicles = 0;
    const errors: string[] = [];

    // Process each vehicle
    for (const vehicle of vehicles) {
      try {
        // Upsert vehicle mapping
        await prisma.vehicleMapping.upsert({
          where: {
            tenant_id_provider_type_provider_vehicle_id: {
              tenant_id: context.tenantId,
              provider_type: providerType,
              provider_vehicle_id: vehicle.id,
            },
          },
          update: {
            registration: vehicle.registration,
            vehicle_name: vehicle.name || null,
            is_active: vehicle.isActive,
          },
          create: {
            tenant_id: context.tenantId,
            provider_type: providerType,
            provider_vehicle_id: vehicle.id,
            routevision_id: vehicle.id, // Legacy compatibility
            registration: vehicle.registration,
            vehicle_name: vehicle.name || null,
            is_active: vehicle.isActive,
          },
        });
        syncedVehicles++;

        // Get trips for vehicle
        const trips = await providerInstance.getTrips(token, vehicle.id, dateFrom, dateTo);

        for (const trip of trips) {
          // Skip running trips
          if (trip.isRunning) continue;

          // Get employee ID from mapping
          const employeeId = vehicleToEmployee.get(vehicle.id) || null;

          // Upsert trip
          await prisma.tripRecord.upsert({
            where: {
              tenant_id_provider_type_provider_trip_id: {
                tenant_id: context.tenantId,
                provider_type: providerType,
                provider_trip_id: trip.id,
              },
            },
            update: {
              vehicle_id: vehicle.id,
              employee_id: employeeId,
              departure_time: trip.departureTime,
              arrival_time: trip.arrivalTime,
              distance_km: trip.distanceKm,
              duration_minutes: trip.durationMinutes,
              departure_address: trip.departure.address,
              departure_postal: trip.departure.postalCode || null,
              departure_lat: trip.departure.lat || null,
              departure_lng: trip.departure.lng || null,
              arrival_address: trip.arrival.address,
              arrival_postal: trip.arrival.postalCode || null,
              arrival_lat: trip.arrival.lat || null,
              arrival_lng: trip.arrival.lng || null,
              is_private: trip.isPrivate,
              is_commute: trip.isCommute,
              synced_at: new Date(),
            },
            create: {
              tenant_id: context.tenantId,
              provider_type: providerType,
              provider_trip_id: trip.id,
              routevision_trip_id: providerType === 'routevision' ? trip.id : null, // Legacy compatibility
              vehicle_id: vehicle.id,
              registration: trip.registration,
              driver_name: trip.driverName || null,
              employee_id: employeeId,
              departure_time: trip.departureTime,
              arrival_time: trip.arrivalTime,
              distance_km: trip.distanceKm,
              duration_minutes: trip.durationMinutes,
              departure_address: trip.departure.address,
              departure_street: trip.departure.street || null,
              departure_house_nr: trip.departure.houseNumber || null,
              departure_postal: trip.departure.postalCode || null,
              departure_city: trip.departure.city || null,
              departure_lat: trip.departure.lat || null,
              departure_lng: trip.departure.lng || null,
              arrival_address: trip.arrival.address,
              arrival_street: trip.arrival.street || null,
              arrival_house_nr: trip.arrival.houseNumber || null,
              arrival_postal: trip.arrival.postalCode || null,
              arrival_city: trip.arrival.city || null,
              arrival_lat: trip.arrival.lat || null,
              arrival_lng: trip.arrival.lng || null,
              is_private: trip.isPrivate,
              is_commute: trip.isCommute,
              is_manual: trip.isManual,
              synced_at: new Date(),
            },
          });
          syncedTrips++;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Vehicle ${vehicle.registration}: ${message}`);
      }
    }

    // Update last sync timestamp
    await prisma.fleetProviderConfig.update({
      where: { id: config.id },
      data: {
        last_sync: new Date(),
        connection_status: 'connected',
      },
    });

    // Auto-match trips to timesheets
    let matchedTrips = 0;
    try {
      const matchResult = await matchTripsToTimesheets(context.tenantId, {
        dateFrom,
        dateTo,
      });
      matchedTrips = matchResult.matched;
    } catch (matchError) {
      const matchMessage = matchError instanceof Error ? matchError.message : 'Unknown error';
      errors.push(`Auto-match failed: ${matchMessage}`);
    }

    return NextResponse.json({
      success: true,
      synced: {
        vehicles: syncedVehicles,
        trips: syncedTrips,
        matched: matchedTrips,
      },
      dateRange: {
        from: dateFrom.toISOString(),
        to: dateTo.toISOString(),
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Fleet provider sync error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 }
    );
  }
}
