/**
 * Verizon Connect Fleet Provider
 *
 * Implementation for Verizon Connect API integration
 * API Documentation: https://developer.verizonconnect.com/
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

const BASE_URL = 'https://fim.api.verizonconnect.com/v1';

interface VerizonVehicle {
  vehicleId: string;
  vehicleName: string;
  registrationNumber?: string;
  make?: string;
  model?: string;
  status: string;
}

interface VerizonTrip {
  tripId: string;
  vehicleId: string;
  vehicleName: string;
  driverId?: string;
  driverName?: string;
  startDateTime: string;
  endDateTime: string;
  distanceMiles: number;
  durationSeconds: number;
  startLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  endLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  tripType?: string;
}

interface VerizonLocation {
  vehicleId: string;
  vehicleName: string;
  registrationNumber?: string;
  latitude: number;
  longitude: number;
  speedMph: number;
  heading: number;
  lastUpdated: string;
  address?: string;
  ignitionStatus: string;
}

export class VerizonProvider extends BaseFleetProvider {
  readonly providerType: FleetProviderType = 'verizon';
  readonly info: FleetProviderInfo = FLEET_PROVIDERS.verizon;

  async authenticate(credentials: FleetProviderCredentials): Promise<string> {
    if (!credentials.apiKey || !credentials.apiSecret) {
      throw new Error('API key and secret are required for Verizon Connect');
    }

    const cacheKey = this.getCacheKey(credentials);
    const cachedToken = this.getCachedToken(cacheKey);
    if (cachedToken) {
      return cachedToken;
    }

    // Verizon uses OAuth2 client credentials
    const response = await fetch(`${BASE_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${credentials.apiKey}:${credentials.apiSecret}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new Error(`Verizon Connect authentication failed: ${response.status}`);
    }

    const data = await response.json();
    if (!data.access_token) {
      throw new Error('Verizon Connect returned no access token');
    }

    this.cacheToken(cacheKey, data.access_token);
    return data.access_token;
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
    const data = await this.apiRequest<{ vehicles: VerizonVehicle[] }>(
      `${BASE_URL}/vehicles`,
      { token }
    );

    return (data.vehicles || []).map((v) => ({
      id: v.vehicleId,
      registration: v.registrationNumber || v.vehicleName,
      name: v.vehicleName,
      brand: v.make,
      model: v.model,
      isActive: v.status === 'Active',
      providerId: v.vehicleId,
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

    const data = await this.apiRequest<{ trips: VerizonTrip[] }>(
      `${BASE_URL}/vehicles/${vehicleId}/trips?startDate=${fromStr}&endDate=${toStr}`,
      { token }
    );

    return (data.trips || []).map((t) => ({
      id: t.tripId,
      vehicleId: t.vehicleId,
      registration: t.vehicleName,
      driverName: t.driverName,
      departureTime: new Date(t.startDateTime),
      arrivalTime: new Date(t.endDateTime),
      distanceKm: t.distanceMiles * 1.60934, // Convert miles to km
      durationMinutes: Math.round(t.durationSeconds / 60),
      departure: {
        address: t.startLocation.address,
        lat: t.startLocation.latitude,
        lng: t.startLocation.longitude,
      },
      arrival: {
        address: t.endLocation.address,
        lat: t.endLocation.latitude,
        lng: t.endLocation.longitude,
      },
      isPrivate: t.tripType === 'Personal',
      isCommute: t.tripType === 'Commute',
      isManual: false,
      isRunning: false,
      providerId: t.tripId,
      providerType: this.providerType,
    }));
  }

  async getVehicleLocations(token: string): Promise<FleetVehicleLocation[]> {
    const data = await this.apiRequest<{ locations: VerizonLocation[] }>(
      `${BASE_URL}/vehicles/locations`,
      { token }
    );

    return (data.locations || []).map((l) => ({
      vehicleId: l.vehicleId,
      registration: l.registrationNumber || l.vehicleName,
      lat: l.latitude,
      lng: l.longitude,
      speed: l.speedMph * 1.60934, // Convert mph to km/h
      heading: l.heading,
      timestamp: new Date(l.lastUpdated),
      address: l.address,
      isIgnitionOn: l.ignitionStatus === 'On',
      providerType: this.providerType,
    }));
  }
}
