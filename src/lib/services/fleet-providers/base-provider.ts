/**
 * Base Fleet Provider
 *
 * Abstract base class for all fleet tracking providers
 */

import {
  FleetProviderType,
  FleetProviderInfo,
  FleetProviderCredentials,
  FleetVehicle,
  FleetTrip,
  FleetVehicleLocation,
  ConnectionTestResult,
  IFleetProvider,
} from './types';

// Token cache for all providers
const tokenCache = new Map<string, { token: string; expiresAt: number }>();

export abstract class BaseFleetProvider implements IFleetProvider {
  abstract readonly providerType: FleetProviderType;
  abstract readonly info: FleetProviderInfo;

  // Token TTL in milliseconds (default 14 minutes)
  protected tokenTTL = 14 * 60 * 1000;

  /**
   * Generate cache key for token caching
   */
  protected getCacheKey(credentials: FleetProviderCredentials): string {
    const parts: string[] = [this.providerType];

    if (credentials.email) parts.push(credentials.email);
    if (credentials.apiKey && typeof credentials.apiKey === 'string') {
      parts.push(credentials.apiKey.slice(0, 8));
    }

    return parts.join(':');
  }

  /**
   * Get cached token if valid
   */
  protected getCachedToken(cacheKey: string): string | null {
    const cached = tokenCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.token;
    }
    tokenCache.delete(cacheKey);
    return null;
  }

  /**
   * Cache a token
   */
  protected cacheToken(cacheKey: string, token: string): void {
    tokenCache.set(cacheKey, {
      token,
      expiresAt: Date.now() + this.tokenTTL,
    });
  }

  /**
   * Format full address from components
   */
  protected formatAddress(
    street?: string,
    houseNumber?: string,
    postalCode?: string,
    city?: string
  ): string {
    const parts: string[] = [];

    if (street) {
      parts.push(houseNumber ? `${street} ${houseNumber}` : street);
    }

    if (postalCode || city) {
      const locationParts: string[] = [];
      if (postalCode) locationParts.push(postalCode);
      if (city) locationParts.push(city);
      parts.push(locationParts.join(' '));
    }

    return parts.join(', ') || 'Onbekend';
  }

  /**
   * Parse duration string to minutes
   */
  protected parseDurationToMinutes(duration: string): number {
    if (!duration) return 0;

    // Try HH:MM:SS format
    const hhmmss = duration.match(/^(\d+):(\d+):(\d+)$/);
    if (hhmmss) {
      const hours = parseInt(hhmmss[1], 10) || 0;
      const minutes = parseInt(hhmmss[2], 10) || 0;
      return hours * 60 + minutes;
    }

    // Try PT format (ISO 8601)
    const ptMatch = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (ptMatch) {
      const hours = parseInt(ptMatch[1], 10) || 0;
      const minutes = parseInt(ptMatch[2], 10) || 0;
      return hours * 60 + minutes;
    }

    // Try plain minutes
    const plainMinutes = parseInt(duration, 10);
    if (!isNaN(plainMinutes)) {
      return plainMinutes;
    }

    return 0;
  }

  /**
   * Make authenticated API request
   */
  protected async apiRequest<T>(
    url: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
      token?: string;
      apiKey?: string;
      body?: unknown;
      headers?: Record<string, string>;
    } = {}
  ): Promise<T> {
    const { method = 'GET', token, apiKey, body, headers = {} } = options;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    if (apiKey) {
      requestHeaders['X-API-Key'] = apiKey;
    }

    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    // Handle empty responses
    const text = await response.text();
    if (!text) {
      return {} as T;
    }

    try {
      return JSON.parse(text);
    } catch {
      // If response is plain text (like a token), return it wrapped
      return text as unknown as T;
    }
  }

  // Abstract methods to be implemented by each provider
  abstract authenticate(credentials: FleetProviderCredentials): Promise<string>;
  abstract testConnection(credentials: FleetProviderCredentials): Promise<ConnectionTestResult>;
  abstract getVehicles(token: string): Promise<FleetVehicle[]>;
  abstract getTrips(token: string, vehicleId: string, dateFrom: Date, dateTo: Date): Promise<FleetTrip[]>;
  abstract getVehicleLocations(token: string): Promise<FleetVehicleLocation[]>;
}
