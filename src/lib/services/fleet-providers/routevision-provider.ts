/**
 * RouteVision Fleet Provider
 *
 * Implementation for RouteVision API integration
 * API Documentation: https://rest.routevision.com/docs/
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

const BASE_URL = 'https://rest.routevision.com';

interface RouteVisionTrip {
  id: string;
  registration: string;
  driverName: string;
  departureDateTime: string;
  arrivalDateTime: string;
  duration: string;
  distance: number;
  departureStreet: string;
  departureHouseNumber: string;
  departurePostalCode: string;
  departureCity: string;
  arrivalStreet: string;
  arrivalHouseNumber: string;
  arrivalPostalCode: string;
  arrivalCity: string;
  isPrivate: boolean;
  isCommute: boolean;
  isManual: boolean;
  isCorrectionTrip: boolean;
  isRunning: boolean;
}

interface RouteVisionVehicle {
  id: string;
  registration: string;
  name?: string;
  brand?: string;
  model?: string;
  isActive?: boolean;
}

interface RouteVisionLocation {
  vehicleId: string;
  registration: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  timestamp: string;
  address?: string;
  isIgnitionOn: boolean;
}

export class RouteVisionProvider extends BaseFleetProvider {
  readonly providerType: FleetProviderType = 'routevision';
  readonly info: FleetProviderInfo = FLEET_PROVIDERS.routevision;

  async authenticate(credentials: FleetProviderCredentials): Promise<string> {
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password are required for RouteVision');
    }

    const cacheKey = this.getCacheKey(credentials);
    const cachedToken = this.getCachedToken(cacheKey);
    if (cachedToken) {
      return cachedToken;
    }

    const response = await fetch(`${BASE_URL}/Login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`RouteVision login failed: ${response.status} - ${errorText}`);
    }

    const token = await response.text();
    if (!token) {
      throw new Error('RouteVision login returned empty token');
    }

    this.cacheToken(cacheKey, token);
    return token;
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
    const data = await this.apiRequest<RouteVisionVehicle[]>(`${BASE_URL}/Vehicle/All`, {
      token,
    });

    return (Array.isArray(data) ? data : []).map((v) => ({
      id: v.id,
      registration: v.registration,
      name: v.name,
      brand: v.brand,
      model: v.model,
      isActive: v.isActive ?? true,
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
    // Validate date range (max 31 days)
    const daysDiff = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 31) {
      throw new Error('Date range cannot exceed 31 days');
    }

    const fromStr = dateFrom.toISOString().split('T')[0];
    const toStr = dateTo.toISOString().split('T')[0];

    const data = await this.apiRequest<RouteVisionTrip[]>(
      `${BASE_URL}/Vehicle/${vehicleId}/Trips?dateFrom=${fromStr}&dateTo=${toStr}`,
      { token }
    );

    return (Array.isArray(data) ? data : []).map((t) => ({
      id: t.id,
      vehicleId: vehicleId,
      registration: t.registration,
      driverName: t.driverName || undefined,
      departureTime: new Date(t.departureDateTime),
      arrivalTime: new Date(t.arrivalDateTime),
      distanceKm: t.distance,
      durationMinutes: this.parseDurationToMinutes(t.duration),
      departure: {
        street: t.departureStreet,
        houseNumber: t.departureHouseNumber,
        postalCode: t.departurePostalCode,
        city: t.departureCity,
        address: this.formatAddress(
          t.departureStreet,
          t.departureHouseNumber,
          t.departurePostalCode,
          t.departureCity
        ),
      },
      arrival: {
        street: t.arrivalStreet,
        houseNumber: t.arrivalHouseNumber,
        postalCode: t.arrivalPostalCode,
        city: t.arrivalCity,
        address: this.formatAddress(
          t.arrivalStreet,
          t.arrivalHouseNumber,
          t.arrivalPostalCode,
          t.arrivalCity
        ),
      },
      isPrivate: t.isPrivate || false,
      isCommute: t.isCommute || false,
      isManual: t.isManual || false,
      isRunning: t.isRunning || false,
      providerId: t.id,
      providerType: this.providerType,
    }));
  }

  async getVehicleLocations(token: string): Promise<FleetVehicleLocation[]> {
    const data = await this.apiRequest<RouteVisionLocation[]>(
      `${BASE_URL}/Vehicle/GetAllVehicleLocations`,
      { token }
    );

    return (Array.isArray(data) ? data : []).map((l) => ({
      vehicleId: l.vehicleId,
      registration: l.registration,
      lat: l.latitude,
      lng: l.longitude,
      speed: l.speed,
      heading: l.heading,
      timestamp: new Date(l.timestamp),
      address: l.address,
      isIgnitionOn: l.isIgnitionOn,
      providerType: this.providerType,
    }));
  }
}
