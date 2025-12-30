/**
 * FleetGO Fleet Provider
 *
 * Implementation for FleetGO API integration
 * API Documentation: https://api.fleetgo.com/docs
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

const BASE_URL = 'https://api.fleetgo.com/v1';

interface FleetGoVehicle {
  id: string;
  licensePlate: string;
  name?: string;
  brand?: string;
  model?: string;
  status: string;
}

interface FleetGoTrip {
  id: string;
  vehicleId: string;
  licensePlate: string;
  driver?: {
    name: string;
  };
  startTime: string;
  endTime: string;
  distanceKm: number;
  durationSeconds: number;
  startAddress: {
    street?: string;
    houseNumber?: string;
    postalCode?: string;
    city?: string;
    formattedAddress: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  endAddress: {
    street?: string;
    houseNumber?: string;
    postalCode?: string;
    city?: string;
    formattedAddress: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  tripType: 'BUSINESS' | 'PRIVATE' | 'COMMUTE';
  status: 'COMPLETED' | 'IN_PROGRESS';
}

interface FleetGoLocation {
  vehicleId: string;
  licensePlate: string;
  position: {
    lat: number;
    lng: number;
  };
  speed: number;
  heading: number;
  timestamp: string;
  address?: string;
  ignitionOn: boolean;
}

export class FleetGoProvider extends BaseFleetProvider {
  readonly providerType: FleetProviderType = 'fleetgo';
  readonly info: FleetProviderInfo = FLEET_PROVIDERS.fleetgo;

  async authenticate(credentials: FleetProviderCredentials): Promise<string> {
    if (!credentials.apiKey) {
      throw new Error('API key is required for FleetGO');
    }

    // FleetGO uses API key directly, no token exchange needed
    // Validate the API key by making a test request
    const cacheKey = this.getCacheKey(credentials);
    const cachedToken = this.getCachedToken(cacheKey);
    if (cachedToken) {
      return cachedToken;
    }

    // Test the API key
    const response = await fetch(`${BASE_URL}/vehicles`, {
      method: 'GET',
      headers: {
        'X-API-Key': credentials.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`FleetGO authentication failed: ${response.status}`);
    }

    // API key is valid, cache it as the "token"
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
    const data = await this.apiRequest<{ vehicles: FleetGoVehicle[] }>(`${BASE_URL}/vehicles`, {
      apiKey: token,
    });

    return (data.vehicles || []).map((v) => ({
      id: v.id,
      registration: v.licensePlate,
      name: v.name,
      brand: v.brand,
      model: v.model,
      isActive: v.status === 'ACTIVE',
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

    const data = await this.apiRequest<{ trips: FleetGoTrip[] }>(
      `${BASE_URL}/vehicles/${vehicleId}/trips?startTime=${fromStr}&endTime=${toStr}`,
      { apiKey: token }
    );

    return (data.trips || []).map((t) => ({
      id: t.id,
      vehicleId: t.vehicleId,
      registration: t.licensePlate,
      driverName: t.driver?.name,
      departureTime: new Date(t.startTime),
      arrivalTime: new Date(t.endTime),
      distanceKm: t.distanceKm,
      durationMinutes: Math.round(t.durationSeconds / 60),
      departure: {
        street: t.startAddress.street,
        houseNumber: t.startAddress.houseNumber,
        postalCode: t.startAddress.postalCode,
        city: t.startAddress.city,
        address: t.startAddress.formattedAddress,
        lat: t.startAddress.coordinates?.lat,
        lng: t.startAddress.coordinates?.lng,
      },
      arrival: {
        street: t.endAddress.street,
        houseNumber: t.endAddress.houseNumber,
        postalCode: t.endAddress.postalCode,
        city: t.endAddress.city,
        address: t.endAddress.formattedAddress,
        lat: t.endAddress.coordinates?.lat,
        lng: t.endAddress.coordinates?.lng,
      },
      isPrivate: t.tripType === 'PRIVATE',
      isCommute: t.tripType === 'COMMUTE',
      isManual: false,
      isRunning: t.status === 'IN_PROGRESS',
      providerId: t.id,
      providerType: this.providerType,
    }));
  }

  async getVehicleLocations(token: string): Promise<FleetVehicleLocation[]> {
    const data = await this.apiRequest<{ locations: FleetGoLocation[] }>(
      `${BASE_URL}/vehicles/locations`,
      { apiKey: token }
    );

    return (data.locations || []).map((l) => ({
      vehicleId: l.vehicleId,
      registration: l.licensePlate,
      lat: l.position.lat,
      lng: l.position.lng,
      speed: l.speed,
      heading: l.heading,
      timestamp: new Date(l.timestamp),
      address: l.address,
      isIgnitionOn: l.ignitionOn,
      providerType: this.providerType,
    }));
  }
}
