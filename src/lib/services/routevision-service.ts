/**
 * RouteVision API Service
 *
 * Client for interacting with the RouteVision REST API for trip registration.
 * API Documentation: https://rest.routevision.com/docs/
 */

const ROUTEVISION_BASE_URL = 'https://rest.routevision.com';

// Cache for JWT tokens (per tenant)
const tokenCache = new Map<string, { token: string; expiresAt: number }>();

// ============== Types ==============

export interface RouteVisionLoginResponse {
  token: string;
}

export interface RouteVisionVehicle {
  id: string;
  registration: string;
  name?: string;
  brand?: string;
  model?: string;
  isActive?: boolean;
}

export interface RouteVisionTrip {
  id: string;
  registration: string;
  driverName: string;
  departureDateTime: string;
  arrivalDateTime: string;
  duration: string;
  distance: number;

  // Departure location
  departureStreet: string;
  departureHouseNumber: string;
  departurePostalCode: string;
  departureCity: string;

  // Arrival location
  arrivalStreet: string;
  arrivalHouseNumber: string;
  arrivalPostalCode: string;
  arrivalCity: string;

  // Flags
  isPrivate: boolean;
  isCommute: boolean;
  isManual: boolean;
  isCorrectionTrip: boolean;
  isRunning: boolean;
}

export interface RouteVisionVehicleLocation {
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

export interface RouteVisionError {
  message: string;
  statusCode: number;
}

// ============== Helper Functions ==============

/**
 * Format a full address from address components
 */
function formatAddress(
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
 * Parse duration string (e.g., "01:30:00") to minutes
 */
function parseDurationToMinutes(duration: string): number {
  if (!duration) return 0;

  const parts = duration.split(':');
  if (parts.length !== 3) return 0;

  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;

  return hours * 60 + minutes;
}

/**
 * Get cached token or return null if expired
 */
function getCachedToken(cacheKey: string): string | null {
  const cached = tokenCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.token;
  }
  tokenCache.delete(cacheKey);
  return null;
}

/**
 * Cache a token with 14 minute TTL (tokens typically expire in 15 min)
 */
function cacheToken(cacheKey: string, token: string): void {
  tokenCache.set(cacheKey, {
    token,
    expiresAt: Date.now() + 14 * 60 * 1000, // 14 minutes
  });
}

// ============== API Functions ==============

/**
 * Login to RouteVision API and get JWT token
 */
export async function login(email: string, password: string): Promise<string> {
  const cacheKey = `${email}:${password}`;

  // Check cache first
  const cachedToken = getCachedToken(cacheKey);
  if (cachedToken) {
    return cachedToken;
  }

  const response = await fetch(`${ROUTEVISION_BASE_URL}/Login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`RouteVision login failed: ${response.status} - ${errorText}`);
  }

  // The API returns the token directly as a string
  const token = await response.text();

  if (!token) {
    throw new Error('RouteVision login returned empty token');
  }

  // Cache the token
  cacheToken(cacheKey, token);

  return token;
}

/**
 * Test connection to RouteVision API
 */
export async function testConnection(email: string, password: string): Promise<{
  success: boolean;
  vehicleCount?: number;
  error?: string;
}> {
  try {
    const token = await login(email, password);
    const vehicles = await getVehicles(token);

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

/**
 * Get all vehicles
 */
export async function getVehicles(token: string): Promise<RouteVisionVehicle[]> {
  const response = await fetch(`${ROUTEVISION_BASE_URL}/Vehicle/All`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get vehicles: ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

/**
 * Get trips for a vehicle within a date range
 * Note: Maximum range is 31 days
 */
export async function getTrips(
  token: string,
  vehicleId: string,
  dateFrom: Date,
  dateTo: Date
): Promise<RouteVisionTrip[]> {
  // Validate date range (max 31 days)
  const daysDiff = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff > 31) {
    throw new Error('Date range cannot exceed 31 days');
  }

  const fromStr = dateFrom.toISOString().split('T')[0];
  const toStr = dateTo.toISOString().split('T')[0];

  const response = await fetch(
    `${ROUTEVISION_BASE_URL}/Vehicle/${vehicleId}/Trips?dateFrom=${fromStr}&dateTo=${toStr}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get trips: ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

/**
 * Get current location of a vehicle
 */
export async function getVehicleLocation(
  token: string,
  vehicleId: string
): Promise<RouteVisionVehicleLocation | null> {
  const response = await fetch(
    `${ROUTEVISION_BASE_URL}/Vehicle/${vehicleId}/Location`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`Failed to get vehicle location: ${response.status}`);
  }

  return await response.json();
}

/**
 * Get all vehicle locations
 */
export async function getAllVehicleLocations(
  token: string
): Promise<RouteVisionVehicleLocation[]> {
  const response = await fetch(
    `${ROUTEVISION_BASE_URL}/Vehicle/GetAllVehicleLocations`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get vehicle locations: ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

// ============== Sync Functions ==============

/**
 * Convert RouteVision trip to database format
 */
export function convertTripToDbFormat(
  trip: RouteVisionTrip,
  tenantId: string,
  vehicleId: string,
  employeeId?: string
) {
  return {
    tenant_id: tenantId,
    provider_type: 'routevision' as const,
    provider_trip_id: trip.id,
    routevision_trip_id: trip.id, // Legacy compatibility
    vehicle_id: vehicleId,
    registration: trip.registration,
    driver_name: trip.driverName || null,
    employee_id: employeeId || null,

    departure_time: new Date(trip.departureDateTime),
    arrival_time: new Date(trip.arrivalDateTime),
    distance_km: trip.distance,
    duration_minutes: parseDurationToMinutes(trip.duration),

    departure_street: trip.departureStreet || null,
    departure_house_nr: trip.departureHouseNumber || null,
    departure_postal: trip.departurePostalCode || null,
    departure_city: trip.departureCity || null,
    departure_address: formatAddress(
      trip.departureStreet,
      trip.departureHouseNumber,
      trip.departurePostalCode,
      trip.departureCity
    ),

    arrival_street: trip.arrivalStreet || null,
    arrival_house_nr: trip.arrivalHouseNumber || null,
    arrival_postal: trip.arrivalPostalCode || null,
    arrival_city: trip.arrivalCity || null,
    arrival_address: formatAddress(
      trip.arrivalStreet,
      trip.arrivalHouseNumber,
      trip.arrivalPostalCode,
      trip.arrivalCity
    ),

    is_private: trip.isPrivate || false,
    is_commute: trip.isCommute || false,
    is_manual: trip.isManual || false,
    is_correction: trip.isCorrectionTrip || false,
  };
}

/**
 * Sync trips for all vehicles for a tenant
 */
export async function syncTripsForTenant(
  token: string,
  tenantId: string,
  vehicleMappings: Map<string, string | null>, // vehicleId -> employeeId
  dateFrom: Date,
  dateTo: Date
): Promise<{
  synced: number;
  errors: string[];
}> {
  const result = {
    synced: 0,
    errors: [] as string[],
  };

  // Get all vehicles
  const vehicles = await getVehicles(token);

  // Process each vehicle
  for (const vehicle of vehicles) {
    try {
      const trips = await getTrips(token, vehicle.id, dateFrom, dateTo);

      // Get employee mapping for this vehicle
      const employeeId = vehicleMappings.get(vehicle.id) || null;

      // Convert trips to DB format
      for (const trip of trips) {
        // Skip running trips (incomplete)
        if (trip.isRunning) continue;

        // Trip will be upserted by the caller
        result.synced++;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(`Vehicle ${vehicle.registration}: ${message}`);
    }
  }

  return result;
}

// ============== Encryption Helpers ==============

/**
 * Simple XOR encryption for API credentials
 * Note: In production, use a proper encryption library like crypto-js
 */
const ENCRYPTION_KEY = process.env.ROUTEVISION_ENCRYPTION_KEY || 'default-key-change-in-production';

export function encryptCredential(text: string): string {
  if (!text) return '';

  let result = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
    result += String.fromCharCode(charCode);
  }

  return Buffer.from(result).toString('base64');
}

export function decryptCredential(encrypted: string): string {
  if (!encrypted) return '';

  try {
    const decoded = Buffer.from(encrypted, 'base64').toString();
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch {
    return '';
  }
}
