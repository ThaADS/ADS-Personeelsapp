/**
 * Geocoding Service
 *
 * Provides geocoding functionality for converting addresses/postal codes to GPS coordinates.
 * Supports multiple providers with intelligent fallback:
 * 1. OpenStreetMap Nominatim (free, rate-limited)
 * 2. Dutch PDOK Locatieserver (free, Netherlands-specific)
 * 3. Local cache for frequently used locations
 */

import crypto from 'crypto';
import { createLogger } from "@/lib/logger";

const logger = createLogger("geocoding-service");

// Types
export interface GeoLocation {
  lat: number;
  lng: number;
  accuracy: 'exact' | 'approximate' | 'region';
  source: 'cache' | 'nominatim' | 'pdok' | 'lookup_table';
  address?: string;
}

interface LRUCacheEntry {
  location: GeoLocation;
  expiresAt: number;
}

/**
 * LRU Cache implementation for geocoding results
 * - Maximum size limit to prevent unbounded memory growth
 * - TTL-based expiration for stale entries
 * - Hit/miss tracking for monitoring
 */
class LRUCache {
  private cache: Map<string, LRUCacheEntry>;
  private readonly maxSize: number;
  private readonly ttl: number;
  private hits: number = 0;
  private misses: number = 0;

  constructor(maxSize: number = 1000, ttlMs: number = 24 * 60 * 60 * 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttlMs;
  }

  get(key: string): GeoLocation | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Check TTL expiration
    if (entry.expiresAt <= Date.now()) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // Move to end (most recently used) - Map iteration order is insertion order
    this.cache.delete(key);
    this.cache.set(key, entry);

    this.hits++;
    return { ...entry.location, source: 'cache' };
  }

  set(key: string, location: GeoLocation): void {
    // If key exists, delete first to update position
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Evict oldest entries if at capacity
    while (this.cache.size >= this.maxSize) {
      // Map.keys().next() gets the first (oldest) key
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      location,
      expiresAt: Date.now() + this.ttl,
    });
  }

  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  getStats(): { size: number; maxSize: number; hitRate: number; hits: number; misses: number } {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: total > 0 ? this.hits / total : 0,
      hits: this.hits,
      misses: this.misses,
    };
  }

  // Periodic cleanup of expired entries
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache) {
      if (entry.expiresAt <= now) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }
}

// LRU cache for geocoding results (max 1000 entries, 24h TTL)
const geocodeCache = new LRUCache(1000, 24 * 60 * 60 * 1000);

// Periodic cleanup every hour
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    geocodeCache.cleanup();
  }, 60 * 60 * 1000);
}

// Rate limiting for external APIs
let lastNominatimCall = 0;
const NOMINATIM_RATE_LIMIT_MS = 1000; // 1 request per second (OSM policy)

/**
 * Dutch postal code region lookup table
 * Based on major cities and regions for quick approximation
 * Format: postal code prefix -> [lat, lng]
 */
const DUTCH_POSTAL_REGIONS: Record<string, [number, number]> = {
  // Amsterdam and surroundings (1000-1099)
  '10': [52.3676, 4.9041],
  '11': [52.3676, 4.9041],
  // Rotterdam (3000-3099)
  '30': [51.9244, 4.4777],
  '31': [51.9244, 4.4777],
  // Den Haag (2500-2599)
  '25': [52.0705, 4.3007],
  '26': [52.0705, 4.3007],
  // Utrecht (3500-3599)
  '35': [52.0907, 5.1214],
  '36': [52.0907, 5.1214],
  // Eindhoven (5600-5699)
  '56': [51.4416, 5.4697],
  '57': [51.4416, 5.4697],
  // Tilburg (5000-5099)
  '50': [51.5555, 5.0913],
  '51': [51.5555, 5.0913],
  // Groningen (9700-9799)
  '97': [53.2194, 6.5665],
  '98': [53.2194, 6.5665],
  // Almere (1300-1399)
  '13': [52.3508, 5.2647],
  // Breda (4800-4899)
  '48': [51.5719, 4.7683],
  // Nijmegen (6500-6599)
  '65': [51.8126, 5.8372],
  // Enschede (7500-7599)
  '75': [52.2215, 6.8937],
  // Haarlem (2000-2099)
  '20': [52.3874, 4.6462],
  // Arnhem (6800-6899)
  '68': [51.9851, 5.8987],
  // Maastricht (6200-6299)
  '62': [50.8514, 5.6909],
  // Dordrecht (3300-3399)
  '33': [51.7948, 4.6772],
  // Leiden (2300-2399)
  '23': [52.1601, 4.4970],
  // 's-Hertogenbosch (5200-5299)
  '52': [51.6998, 5.3049],
  // Amersfoort (3800-3899)
  '38': [52.1561, 5.3878],
  // Zwolle (8000-8099)
  '80': [52.5168, 6.0830],
  // Apeldoorn (7300-7399)
  '73': [52.2112, 5.9699],
  // Deventer (7400-7499)
  '74': [52.2554, 6.1553],
  // Leeuwarden (8900-8999)
  '89': [53.2012, 5.7999],
  // Assen (9400-9499)
  '94': [52.9925, 6.5649],
  // Middelburg (4300-4399)
  '43': [51.4988, 3.6109],
};

/**
 * Generate cache key from input
 */
function getCacheKey(input: string): string {
  return crypto.createHash('md5').update(input.toLowerCase().trim()).digest('hex');
}

/**
 * Get approximate location from Dutch postal code using lookup table
 */
function getFromLookupTable(postalCode: string): GeoLocation | null {
  const cleaned = postalCode.replace(/\s/g, '').toUpperCase();
  const numericPart = cleaned.replace(/\D/g, '');

  if (numericPart.length < 2) return null;

  // Try 2-digit prefix first
  const prefix = numericPart.substring(0, 2);
  const coords = DUTCH_POSTAL_REGIONS[prefix];

  if (coords) {
    return {
      lat: coords[0],
      lng: coords[1],
      accuracy: 'region',
      source: 'lookup_table',
    };
  }

  // Fallback: calculate approximate position based on postal code number
  // Dutch postal codes range from ~1000 to ~9999
  const codeNum = parseInt(numericPart.substring(0, 4), 10);
  if (isNaN(codeNum) || codeNum < 1000 || codeNum > 9999) return null;

  // Netherlands roughly spans lat 50.75-53.5, lng 3.3-7.2
  // This is a very rough approximation
  const normalized = (codeNum - 1000) / 9000;

  return {
    lat: 50.75 + normalized * 2.75,
    lng: 3.3 + normalized * 3.9,
    accuracy: 'approximate',
    source: 'lookup_table',
  };
}

/**
 * Query PDOK Locatieserver (Dutch government geocoding service)
 */
async function queryPDOK(query: string): Promise<GeoLocation | null> {
  try {
    const url = new URL('https://api.pdok.nl/bzk/locatieserver/search/v3_1/free');
    url.searchParams.set('q', query);
    url.searchParams.set('rows', '1');
    url.searchParams.set('fq', 'type:postcode OR type:adres');

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ADS-Personeelsapp/1.0',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      logger.warn("PDOK API error", { status: response.status, query });
      return null;
    }

    const data = await response.json();

    if (data.response?.docs?.length > 0) {
      const doc = data.response.docs[0];
      // PDOK returns centroide_ll in "POINT(lng lat)" format
      const match = doc.centroide_ll?.match(/POINT\(([^ ]+) ([^)]+)\)/);
      if (match) {
        return {
          lat: parseFloat(match[2]),
          lng: parseFloat(match[1]),
          accuracy: doc.type === 'adres' ? 'exact' : 'approximate',
          source: 'pdok',
          address: doc.weergavenaam,
        };
      }
    }

    return null;
  } catch (error) {
    logger.warn("PDOK geocoding failed", { query, error: error instanceof Error ? error.message : 'Unknown error' });
    return null;
  }
}

/**
 * Query OpenStreetMap Nominatim
 */
async function queryNominatim(query: string): Promise<GeoLocation | null> {
  // Rate limiting
  const now = Date.now();
  const timeSinceLastCall = now - lastNominatimCall;
  if (timeSinceLastCall < NOMINATIM_RATE_LIMIT_MS) {
    await new Promise(resolve => setTimeout(resolve, NOMINATIM_RATE_LIMIT_MS - timeSinceLastCall));
  }
  lastNominatimCall = Date.now();

  try {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('q', `${query}, Netherlands`);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '1');
    url.searchParams.set('countrycodes', 'nl');

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ADS-Personeelsapp/1.0 (support@adspersoneelapp.nl)',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      logger.warn("Nominatim API error", { status: response.status, query });
      return null;
    }

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      const result = data[0];
      const placeType = result.type;

      // Determine accuracy based on place type
      let accuracy: GeoLocation['accuracy'] = 'approximate';
      if (['house', 'building', 'address'].includes(placeType)) {
        accuracy = 'exact';
      } else if (['postcode', 'city', 'town', 'village'].includes(placeType)) {
        accuracy = 'region';
      }

      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        accuracy,
        source: 'nominatim',
        address: result.display_name,
      };
    }

    return null;
  } catch (error) {
    logger.warn("Nominatim geocoding failed", { query, error: error instanceof Error ? error.message : 'Unknown error' });
    return null;
  }
}

/**
 * Geocode a Dutch postal code
 */
export async function geocodePostalCode(postalCode: string): Promise<GeoLocation | null> {
  if (!postalCode) return null;

  const cacheKey = getCacheKey(`postal:${postalCode}`);

  // Check LRU cache
  const cached = geocodeCache.get(cacheKey);
  if (cached) return cached;

  // Try PDOK first (Dutch-specific, faster for postal codes)
  const pdokResult = await queryPDOK(postalCode);
  if (pdokResult) {
    geocodeCache.set(cacheKey, pdokResult);
    return pdokResult;
  }

  // Fallback to lookup table for quick approximation
  const lookupResult = getFromLookupTable(postalCode);
  if (lookupResult) {
    geocodeCache.set(cacheKey, lookupResult);
    return lookupResult;
  }

  return null;
}

/**
 * Geocode a full address
 */
export async function geocodeAddress(address: string): Promise<GeoLocation | null> {
  if (!address) return null;

  const cacheKey = getCacheKey(`address:${address}`);

  // Check LRU cache
  const cached = geocodeCache.get(cacheKey);
  if (cached) return cached;

  // Try PDOK first
  const pdokResult = await queryPDOK(address);
  if (pdokResult) {
    geocodeCache.set(cacheKey, pdokResult);
    return pdokResult;
  }

  // Fallback to Nominatim
  const nominatimResult = await queryNominatim(address);
  if (nominatimResult) {
    geocodeCache.set(cacheKey, nominatimResult);
    return nominatimResult;
  }

  return null;
}

/**
 * Geocode either a postal code or full address (auto-detect)
 */
export async function geocode(input: string): Promise<GeoLocation | null> {
  if (!input) return null;

  const cleaned = input.trim();

  // Check if it looks like a Dutch postal code (4 digits + optional 2 letters)
  if (/^\d{4}\s?[A-Za-z]{0,2}$/.test(cleaned)) {
    return geocodePostalCode(cleaned);
  }

  // Otherwise treat as full address
  return geocodeAddress(cleaned);
}

/**
 * Calculate distance between two locations in meters using Haversine formula
 */
export function calculateDistance(loc1: GeoLocation, loc2: GeoLocation): number {
  const R = 6371e3; // Earth's radius in meters
  const lat1Rad = (loc1.lat * Math.PI) / 180;
  const lat2Rad = (loc2.lat * Math.PI) / 180;
  const deltaLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
  const deltaLng = ((loc2.lng - loc1.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Check if two locations are within a certain radius
 */
export function isWithinRadius(
  loc1: GeoLocation,
  loc2: GeoLocation,
  radiusMeters: number
): boolean {
  return calculateDistance(loc1, loc2) <= radiusMeters;
}

/**
 * Clear geocoding cache (useful for testing)
 */
export function clearGeocodingCache(): void {
  geocodeCache.clear();
}

/**
 * Get cache statistics
 */
export function getGeocachingStats(): {
  size: number;
  maxSize: number;
  hitRate: number;
  hits: number;
  misses: number;
} {
  return geocodeCache.getStats();
}

/**
 * Force cleanup of expired cache entries
 */
export function cleanupGeocodingCache(): number {
  return geocodeCache.cleanup();
}
