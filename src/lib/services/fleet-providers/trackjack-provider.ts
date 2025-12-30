/**
 * TrackJack Fleet Provider
 *
 * Implementation for TrackJack API integration
 * API Documentation: https://trackjack.nl/api-documentatie
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

const BASE_URL = 'https://api.trackjack.nl/v1';

interface TrackJackVehicle {
  id: number;
  kenteken: string;
  naam?: string;
  merk?: string;
  type?: string;
  actief: boolean;
}

interface TrackJackRit {
  id: number;
  voertuig_id: number;
  kenteken: string;
  bestuurder?: string;
  start_tijd: string;
  eind_tijd: string;
  afstand_km: number;
  duur_minuten: number;
  start_adres: string;
  start_lat?: number;
  start_lng?: number;
  eind_adres: string;
  eind_lat?: number;
  eind_lng?: number;
  rit_type: 'zakelijk' | 'prive' | 'woon_werk';
  handmatig: boolean;
}

interface TrackJackLocatie {
  voertuig_id: number;
  kenteken: string;
  lat: number;
  lng: number;
  snelheid: number;
  richting: number;
  tijdstip: string;
  adres?: string;
  contact_aan: boolean;
}

export class TrackJackProvider extends BaseFleetProvider {
  readonly providerType: FleetProviderType = 'trackjack';
  readonly info: FleetProviderInfo = FLEET_PROVIDERS.trackjack;

  async authenticate(credentials: FleetProviderCredentials): Promise<string> {
    if (!credentials.email || !credentials.password) {
      throw new Error('Email en wachtwoord zijn vereist voor TrackJack');
    }

    const cacheKey = this.getCacheKey(credentials);
    const cachedToken = this.getCachedToken(cacheKey);
    if (cachedToken) {
      return cachedToken;
    }

    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: credentials.email,
        wachtwoord: credentials.password,
      }),
    });

    if (!response.ok) {
      throw new Error(`TrackJack login mislukt: ${response.status}`);
    }

    const data = await response.json();
    if (!data.token) {
      throw new Error('TrackJack login retourneerde geen token');
    }

    this.cacheToken(cacheKey, data.token);
    return data.token;
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
        error: error instanceof Error ? error.message : 'Onbekende fout',
      };
    }
  }

  async getVehicles(token: string): Promise<FleetVehicle[]> {
    const data = await this.apiRequest<{ voertuigen: TrackJackVehicle[] }>(
      `${BASE_URL}/voertuigen`,
      { token }
    );

    return (data.voertuigen || []).map((v) => ({
      id: String(v.id),
      registration: v.kenteken,
      name: v.naam,
      brand: v.merk,
      model: v.type,
      isActive: v.actief,
      providerId: String(v.id),
      providerType: this.providerType,
    }));
  }

  async getTrips(
    token: string,
    vehicleId: string,
    dateFrom: Date,
    dateTo: Date
  ): Promise<FleetTrip[]> {
    const fromStr = dateFrom.toISOString().split('T')[0];
    const toStr = dateTo.toISOString().split('T')[0];

    const data = await this.apiRequest<{ ritten: TrackJackRit[] }>(
      `${BASE_URL}/voertuigen/${vehicleId}/ritten?van=${fromStr}&tot=${toStr}`,
      { token }
    );

    return (data.ritten || []).map((r) => ({
      id: String(r.id),
      vehicleId: String(r.voertuig_id),
      registration: r.kenteken,
      driverName: r.bestuurder,
      departureTime: new Date(r.start_tijd),
      arrivalTime: new Date(r.eind_tijd),
      distanceKm: r.afstand_km,
      durationMinutes: r.duur_minuten,
      departure: {
        address: r.start_adres,
        lat: r.start_lat,
        lng: r.start_lng,
      },
      arrival: {
        address: r.eind_adres,
        lat: r.eind_lat,
        lng: r.eind_lng,
      },
      isPrivate: r.rit_type === 'prive',
      isCommute: r.rit_type === 'woon_werk',
      isManual: r.handmatig,
      isRunning: false,
      providerId: String(r.id),
      providerType: this.providerType,
    }));
  }

  async getVehicleLocations(token: string): Promise<FleetVehicleLocation[]> {
    const data = await this.apiRequest<{ locaties: TrackJackLocatie[] }>(
      `${BASE_URL}/voertuigen/locaties`,
      { token }
    );

    return (data.locaties || []).map((l) => ({
      vehicleId: String(l.voertuig_id),
      registration: l.kenteken,
      lat: l.lat,
      lng: l.lng,
      speed: l.snelheid,
      heading: l.richting,
      timestamp: new Date(l.tijdstip),
      address: l.adres,
      isIgnitionOn: l.contact_aan,
      providerType: this.providerType,
    }));
  }
}
