/**
 * Webfleet (TomTom) Fleet Provider
 *
 * Implementation for Webfleet/TomTom Telematics API integration
 * API Documentation: https://developer.webfleet.com/
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

const BASE_URL = 'https://csv.webfleet.com/extern';

interface WebfleetVehicle {
  objectno: string;
  objectname: string;
  licensePlate: string;
  objecttype: string;
  status: string;
}

interface WebfleetTrip {
  tripno: string;
  objectno: string;
  objectname: string;
  driverno?: string;
  drivername?: string;
  starttime: string;
  endtime: string;
  distance: number; // in meters
  triptype: string;
  startaddress: string;
  startlatitude: number;
  startlongitude: number;
  endaddress: string;
  endlatitude: number;
  endlongitude: number;
}

interface WebfleetLocation {
  objectno: string;
  objectname: string;
  latitude: number;
  longitude: number;
  speed: number;
  course: number;
  postime: string;
  ignition: boolean;
}

export class WebfleetProvider extends BaseFleetProvider {
  readonly providerType: FleetProviderType = 'webfleet';
  readonly info: FleetProviderInfo = FLEET_PROVIDERS.webfleet;

  private account: string = '';
  private username: string = '';
  private password: string = '';

  async authenticate(credentials: FleetProviderCredentials): Promise<string> {
    if (!credentials.email || !credentials.password) {
      throw new Error('Account, username, and password are required for Webfleet');
    }

    // Webfleet uses account@username format
    const [account, username] = credentials.email.split('@');
    if (!account || !username) {
      throw new Error('Email should be in format: account@username');
    }

    this.account = account;
    this.username = username;
    this.password = credentials.password;

    const cacheKey = this.getCacheKey(credentials);
    const cachedToken = this.getCachedToken(cacheKey);
    if (cachedToken) {
      return cachedToken;
    }

    // Webfleet uses session-based auth
    const params = new URLSearchParams({
      account: this.account,
      username: this.username,
      password: this.password,
      apikey: credentials.customFields?.apiKey || '',
      lang: 'nl',
    });

    const response = await fetch(`${BASE_URL}?action=createSession&${params}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Webfleet authentication failed: ${response.status}`);
    }

    const text = await response.text();
    // Webfleet returns CSV, parse session ID from first line
    const lines = text.trim().split('\n');
    if (lines.length < 1 || lines[0].includes('Error')) {
      throw new Error(`Webfleet authentication failed: ${lines[0]}`);
    }

    const sessionId = lines[0].split(';')[0];
    this.cacheToken(cacheKey, sessionId);
    return sessionId;
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
    const params = new URLSearchParams({
      account: this.account,
      username: this.username,
      password: this.password,
      sessionid: token,
      lang: 'nl',
    });

    const response = await fetch(`${BASE_URL}?action=showObjectReportExtern&${params}`);
    const text = await response.text();

    // Parse CSV response
    const lines = text.trim().split('\n');
    const vehicles: FleetVehicle[] = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(';');
      if (parts.length >= 4) {
        vehicles.push({
          id: parts[0],
          registration: parts[2] || parts[1],
          name: parts[1],
          isActive: parts[4] !== 'INACTIVE',
          providerId: parts[0],
          providerType: this.providerType,
        });
      }
    }

    return vehicles;
  }

  async getTrips(
    token: string,
    vehicleId: string,
    dateFrom: Date,
    dateTo: Date
  ): Promise<FleetTrip[]> {
    const fromStr = dateFrom.toISOString().replace('T', ' ').split('.')[0];
    const toStr = dateTo.toISOString().replace('T', ' ').split('.')[0];

    const params = new URLSearchParams({
      account: this.account,
      username: this.username,
      password: this.password,
      sessionid: token,
      objectno: vehicleId,
      rangefrom_string: fromStr,
      rangeto_string: toStr,
      lang: 'nl',
    });

    const response = await fetch(`${BASE_URL}?action=showTripReportExtern&${params}`);
    const text = await response.text();

    // Parse CSV response
    const lines = text.trim().split('\n');
    const trips: FleetTrip[] = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(';');
      if (parts.length >= 12) {
        const startTime = new Date(parts[4]);
        const endTime = new Date(parts[5]);
        const durationMs = endTime.getTime() - startTime.getTime();

        trips.push({
          id: parts[0],
          vehicleId: parts[1],
          registration: parts[2],
          driverName: parts[3] || undefined,
          departureTime: startTime,
          arrivalTime: endTime,
          distanceKm: parseFloat(parts[6]) / 1000,
          durationMinutes: Math.round(durationMs / (1000 * 60)),
          departure: {
            address: parts[8],
            lat: parseFloat(parts[9]),
            lng: parseFloat(parts[10]),
          },
          arrival: {
            address: parts[11],
            lat: parseFloat(parts[12]),
            lng: parseFloat(parts[13]),
          },
          isPrivate: parts[7] === 'PRIVATE',
          isCommute: parts[7] === 'COMMUTE',
          isManual: false,
          isRunning: false,
          providerId: parts[0],
          providerType: this.providerType,
        });
      }
    }

    return trips;
  }

  async getVehicleLocations(token: string): Promise<FleetVehicleLocation[]> {
    const params = new URLSearchParams({
      account: this.account,
      username: this.username,
      password: this.password,
      sessionid: token,
      lang: 'nl',
    });

    const response = await fetch(`${BASE_URL}?action=showObjectReportExtern&${params}`);
    const text = await response.text();

    // Parse CSV response
    const lines = text.trim().split('\n');
    const locations: FleetVehicleLocation[] = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(';');
      if (parts.length >= 8) {
        locations.push({
          vehicleId: parts[0],
          registration: parts[2] || parts[1],
          lat: parseFloat(parts[5]),
          lng: parseFloat(parts[6]),
          speed: parseFloat(parts[7]) || 0,
          heading: 0,
          timestamp: new Date(parts[4]),
          isIgnitionOn: parts[8] === '1',
          providerType: this.providerType,
        });
      }
    }

    return locations;
  }
}
