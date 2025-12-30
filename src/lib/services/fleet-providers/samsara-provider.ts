/**
 * Samsara Fleet Provider
 *
 * Implementation for Samsara API integration
 * API Documentation: https://developers.samsara.com/docs
 */

import { BaseFleetProvider } from './base-provider';
import {
  FleetProviderType,
  FleetProviderInfo,
  FleetProviderCredentials,
  FleetVehicle,
  FleetTrip,
  FleetVehicleLocation,
  ConnectionTestResult,
  FLEET_PROVIDERS,
} from './types';

const BASE_URL = 'https://api.samsara.com';

interface SamsaraVehicle {
  id: string;
  name: string;
  licensePlate?: string;
  make?: string;
  model?: string;
  vin?: string;
}

interface SamsaraTrip {
  id: string;
  vehicle: {
    id: string;
    name: string;
  };
  driver?: {
    id: string;
    name: string;
  };
  startTime: string;
  endTime: string;
  distanceMeters: number;
  startLocation: {
    latitude: number;
    longitude: number;
    formattedAddress?: string;
  };
  endLocation: {
    latitude: number;
    longitude: number;
    formattedAddress?: string;
  };
}

interface SamsaraLocation {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
    time: string;
    formattedAddress?: string;
  };
  engineState?: {
    value: 'On' | 'Off';
  };
}

export class SamsaraProvider extends BaseFleetProvider {
  readonly providerType: FleetProviderType = 'samsara';
  readonly info: FleetProviderInfo = FLEET_PROVIDERS.samsara;

  async authenticate(credentials: FleetProviderCredentials): Promise<string> {
    if (!credentials.apiKey) {
      throw new Error('API key is required for Samsara');
    }

    const cacheKey = this.getCacheKey(credentials);
    const cachedToken = this.getCachedToken(cacheKey);
    if (cachedToken) {
      return cachedToken;
    }

    // Test the API key
    const response = await fetch(`${BASE_URL}/fleet/vehicles`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${credentials.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Samsara authentication failed: ${response.status}`);
    }

    this.cacheToken(cacheKey, credentials.apiKey);
    return credentials.apiKey;
  }

  async testConnection(credentials: FleetProviderCredentials): Promise<ConnectionTestResult> {
    try {
      const token = await this.authenticate(credentials);
      const vehicles = await this.getVehicles(token);

      return {
        success: true,
        vehicleCount: vehicles.length,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getVehicles(token: string): Promise<FleetVehicle[]> {
    const data = await this.apiRequest<{ data: SamsaraVehicle[] }>(
      `${BASE_URL}/fleet/vehicles`,
      { token }
    );

    return (data.data || []).map((v) => ({
      id: v.id,
      registration: v.licensePlate || v.name,
      name: v.name,
      brand: v.make,
      model: v.model,
      isActive: true,
      providerId: v.id,
      providerType: this.providerType,
    }));
  }

  async getTrips(
    token: string,
    vehicleId: string,
    dateFrom: Date,
    dateTo: Date
  ): Promise<FleetTrip[]> {
    const fromStr = dateFrom.toISOString();
    const toStr = dateTo.toISOString();

    const data = await this.apiRequest<{ data: SamsaraTrip[] }>(
      `${BASE_URL}/fleet/vehicles/${vehicleId}/trips?startTime=${fromStr}&endTime=${toStr}`,
      { token }
    );

    return (data.data || []).map((t) => {
      const durationMs = new Date(t.endTime).getTime() - new Date(t.startTime).getTime();

      return {
        id: t.id,
        vehicleId: t.vehicle.id,
        registration: t.vehicle.name,
        driverName: t.driver?.name,
        departureTime: new Date(t.startTime),
        arrivalTime: new Date(t.endTime),
        distanceKm: t.distanceMeters / 1000,
        durationMinutes: Math.round(durationMs / (1000 * 60)),
        departure: {
          address: t.startLocation.formattedAddress || 'Unknown',
          lat: t.startLocation.latitude,
          lng: t.startLocation.longitude,
        },
        arrival: {
          address: t.endLocation.formattedAddress || 'Unknown',
          lat: t.endLocation.latitude,
          lng: t.endLocation.longitude,
        },
        isPrivate: false, // Samsara doesn't have trip type by default
        isCommute: false,
        isManual: false,
        isRunning: false,
        providerId: t.id,
        providerType: this.providerType,
      };
    });
  }

  async getVehicleLocations(token: string): Promise<FleetVehicleLocation[]> {
    const data = await this.apiRequest<{ data: SamsaraLocation[] }>(
      `${BASE_URL}/fleet/vehicles/locations`,
      { token }
    );

    return (data.data || []).map((l) => ({
      vehicleId: l.id,
      registration: l.name,
      lat: l.location.latitude,
      lng: l.location.longitude,
      speed: l.location.speed || 0,
      heading: l.location.heading || 0,
      timestamp: new Date(l.location.time),
      address: l.location.formattedAddress,
      isIgnitionOn: l.engineState?.value === 'On',
      providerType: this.providerType,
    }));
  }
}
