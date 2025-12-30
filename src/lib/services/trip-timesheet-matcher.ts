/**
 * Trip-Timesheet Matcher Service
 *
 * Automatically matches RouteVision trips to employee timesheets based on:
 * 1. Same employee (via vehicle mapping)
 * 2. Overlapping time periods
 * 3. Optional GPS location proximity
 */

import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

// Types
interface MatchResult {
  tripId: string;
  timesheetId: string | null;
  confidence: number; // 0-1
  matchReason: string;
}

interface MatchingStats {
  totalTrips: number;
  matched: number;
  unmatched: number;
  results: MatchResult[];
}

interface GPSLocation {
  lat: number;
  lng: number;
}

// Configuration
const MATCH_CONFIG = {
  // Time overlap threshold in minutes - trip must overlap at least this much with timesheet
  MIN_OVERLAP_MINUTES: 5,
  // Maximum time difference in minutes for start times to be considered "close"
  MAX_START_DIFF_MINUTES: 60,
  // GPS distance threshold in meters for location matching
  GPS_MATCH_RADIUS_METERS: 500,
  // Confidence weights
  WEIGHTS: {
    SAME_EMPLOYEE: 0.4,
    TIME_OVERLAP: 0.35,
    GPS_MATCH: 0.25,
  },
};

/**
 * Calculate the Haversine distance between two GPS coordinates
 * Returns distance in meters
 */
function calculateDistance(loc1: GPSLocation, loc2: GPSLocation): number {
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
 * Calculate time overlap between two time ranges in minutes
 */
function calculateOverlapMinutes(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): number {
  const overlapStart = Math.max(start1.getTime(), start2.getTime());
  const overlapEnd = Math.min(end1.getTime(), end2.getTime());

  if (overlapEnd <= overlapStart) {
    return 0;
  }

  return (overlapEnd - overlapStart) / (1000 * 60);
}

/**
 * Parse GPS location from timesheet location_start or location_end JSON
 */
function parseTimesheetLocation(
  locationJson: Prisma.JsonValue | null
): GPSLocation | null {
  if (!locationJson || typeof locationJson !== "object") {
    return null;
  }

  const location = locationJson as Record<string, unknown>;
  const coords = location.coords as Record<string, unknown> | undefined;

  // Support various formats
  const lat = location.lat ?? location.latitude ?? coords?.lat;
  const lng =
    location.lng ??
    location.lon ??
    location.longitude ??
    coords?.lng ??
    coords?.lon;

  if (typeof lat === "number" && typeof lng === "number") {
    return { lat, lng };
  }

  // Try parsing strings
  const parsedLat = parseFloat(String(lat));
  const parsedLng = parseFloat(String(lng));

  if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
    return { lat: parsedLat, lng: parsedLng };
  }

  return null;
}

/**
 * Calculate match confidence between a trip and timesheet
 */
function calculateMatchConfidence(
  trip: {
    employee_id: string | null;
    departure_time: Date;
    arrival_time: Date;
    departure_postal: string | null;
    arrival_postal: string | null;
  },
  timesheet: {
    userId: string;
    startTime: Date;
    endTime: Date;
    location_start: Prisma.JsonValue | null;
    location_end: Prisma.JsonValue | null;
  },
  employeeUserId: string | null
): { confidence: number; reasons: string[] } {
  let confidence = 0;
  const reasons: string[] = [];

  // 1. Same employee check
  if (employeeUserId && timesheet.userId === employeeUserId) {
    confidence += MATCH_CONFIG.WEIGHTS.SAME_EMPLOYEE;
    reasons.push("Zelfde medewerker");
  }

  // 2. Time overlap check
  const overlapMinutes = calculateOverlapMinutes(
    trip.departure_time,
    trip.arrival_time,
    timesheet.startTime,
    timesheet.endTime
  );

  if (overlapMinutes >= MATCH_CONFIG.MIN_OVERLAP_MINUTES) {
    // Calculate overlap score based on how much of the trip overlaps
    const tripDurationMinutes =
      (trip.arrival_time.getTime() - trip.departure_time.getTime()) /
      (1000 * 60);
    const overlapRatio = Math.min(overlapMinutes / tripDurationMinutes, 1);

    const timeScore = overlapRatio * MATCH_CONFIG.WEIGHTS.TIME_OVERLAP;
    confidence += timeScore;
    reasons.push(`${Math.round(overlapMinutes)} min overlap`);
  }

  // 3. GPS location match (if available)
  const tripStartLocation = parsePostalCodeToApproxLocation(
    trip.departure_postal
  );
  const timesheetStartLocation = parseTimesheetLocation(
    timesheet.location_start
  );

  if (tripStartLocation && timesheetStartLocation) {
    const distance = calculateDistance(tripStartLocation, timesheetStartLocation);

    if (distance <= MATCH_CONFIG.GPS_MATCH_RADIUS_METERS) {
      confidence += MATCH_CONFIG.WEIGHTS.GPS_MATCH;
      reasons.push(`Locatie match (${Math.round(distance)}m)`);
    }
  }

  return { confidence, reasons };
}

/**
 * Approximate GPS coordinates from Dutch postal code
 * This is a simplified lookup - in production, use a geocoding service
 */
function parsePostalCodeToApproxLocation(
  postalCode: string | null
): GPSLocation | null {
  if (!postalCode) return null;

  // Dutch postal codes are 4 digits + 2 letters
  // This is a simplified approximation based on major areas
  const numericPart = parseInt(postalCode.replace(/\D/g, "").slice(0, 4), 10);

  if (isNaN(numericPart)) return null;

  // Very rough approximation of Dutch postal code regions
  // In production, use a proper geocoding API
  // Netherlands roughly spans lat 50.75-53.5, lng 3.3-7.2
  const latBase = 50.75;
  const lngBase = 3.3;

  // Postal codes range from ~1000 (Amsterdam) to ~9999 (Groningen area)
  const normalized = (numericPart - 1000) / 9000;

  return {
    lat: latBase + normalized * 2.75,
    lng: lngBase + normalized * 3.9,
  };
}

/**
 * Find the best matching timesheet for a trip
 */
async function findBestTimesheetMatch(
  trip: {
    id: string;
    tenant_id: string;
    employee_id: string | null;
    departure_time: Date;
    arrival_time: Date;
    departure_postal: string | null;
    arrival_postal: string | null;
  }
): Promise<MatchResult> {
  // Get the employee's user_id if we have an employee_id
  let employeeUserId: string | null = null;

  if (trip.employee_id) {
    const employee = await prisma.employees.findUnique({
      where: { id: trip.employee_id },
      select: { user_id: true },
    });
    employeeUserId = employee?.user_id || null;
  }

  // Find potential matching timesheets
  // Look for timesheets on the same day with overlapping times
  const tripDate = new Date(trip.departure_time);
  tripDate.setHours(0, 0, 0, 0);
  const nextDay = new Date(tripDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const whereClause: Prisma.TimesheetWhereInput = {
    tenantId: trip.tenant_id,
    date: {
      gte: tripDate,
      lt: nextDay,
    },
  };

  // If we have an employee, prioritize their timesheets
  if (employeeUserId) {
    whereClause.userId = employeeUserId;
  }

  const potentialTimesheets = await prisma.timesheet.findMany({
    where: whereClause,
    select: {
      id: true,
      userId: true,
      startTime: true,
      endTime: true,
      location_start: true,
      location_end: true,
    },
  });

  if (potentialTimesheets.length === 0) {
    return {
      tripId: trip.id,
      timesheetId: null,
      confidence: 0,
      matchReason: "Geen tijdregistraties gevonden",
    };
  }

  // Calculate match confidence for each timesheet
  let bestMatch: { timesheet: (typeof potentialTimesheets)[0]; confidence: number; reasons: string[] } | null = null;

  for (const timesheet of potentialTimesheets) {
    const { confidence, reasons } = calculateMatchConfidence(
      trip,
      timesheet,
      employeeUserId
    );

    if (!bestMatch || confidence > bestMatch.confidence) {
      bestMatch = { timesheet, confidence, reasons };
    }
  }

  if (!bestMatch || bestMatch.confidence < 0.3) {
    return {
      tripId: trip.id,
      timesheetId: null,
      confidence: bestMatch?.confidence || 0,
      matchReason: "Geen goede match gevonden",
    };
  }

  return {
    tripId: trip.id,
    timesheetId: bestMatch.timesheet.id,
    confidence: bestMatch.confidence,
    matchReason: bestMatch.reasons.join(", "),
  };
}

/**
 * Match all unmatched trips for a tenant to timesheets
 */
export async function matchTripsToTimesheets(
  tenantId: string,
  options?: {
    forceRematch?: boolean;
    dateFrom?: Date;
    dateTo?: Date;
  }
): Promise<MatchingStats> {
  const { forceRematch = false, dateFrom, dateTo } = options || {};

  // Build where clause
  const whereClause: Prisma.TripRecordWhereInput = {
    tenant_id: tenantId,
    is_private: false, // Don't match private trips
  };

  if (!forceRematch) {
    whereClause.timesheet_id = null; // Only unmatched trips
  }

  if (dateFrom) {
    whereClause.departure_time = {
      ...(whereClause.departure_time as Prisma.DateTimeFilter | undefined),
      gte: dateFrom,
    };
  }

  if (dateTo) {
    whereClause.arrival_time = {
      ...(whereClause.arrival_time as Prisma.DateTimeFilter | undefined),
      lte: dateTo,
    };
  }

  // Get trips to match
  const trips = await prisma.tripRecord.findMany({
    where: whereClause,
    select: {
      id: true,
      tenant_id: true,
      employee_id: true,
      departure_time: true,
      arrival_time: true,
      departure_postal: true,
      arrival_postal: true,
    },
    orderBy: {
      departure_time: "asc",
    },
  });

  const stats: MatchingStats = {
    totalTrips: trips.length,
    matched: 0,
    unmatched: 0,
    results: [],
  };

  // Process each trip
  for (const trip of trips) {
    const result = await findBestTimesheetMatch(trip);
    stats.results.push(result);

    if (result.timesheetId) {
      // Update the trip with the matched timesheet
      await prisma.tripRecord.update({
        where: { id: trip.id },
        data: { timesheet_id: result.timesheetId },
      });
      stats.matched++;
    } else {
      stats.unmatched++;
    }
  }

  return stats;
}

/**
 * Match a single trip to timesheets
 */
export async function matchSingleTrip(tripId: string): Promise<MatchResult> {
  const trip = await prisma.tripRecord.findUnique({
    where: { id: tripId },
    select: {
      id: true,
      tenant_id: true,
      employee_id: true,
      departure_time: true,
      arrival_time: true,
      departure_postal: true,
      arrival_postal: true,
    },
  });

  if (!trip) {
    return {
      tripId,
      timesheetId: null,
      confidence: 0,
      matchReason: "Rit niet gevonden",
    };
  }

  const result = await findBestTimesheetMatch(trip);

  if (result.timesheetId) {
    await prisma.tripRecord.update({
      where: { id: tripId },
      data: { timesheet_id: result.timesheetId },
    });
  }

  return result;
}

/**
 * Clear timesheet matches for a tenant (for re-matching)
 */
export async function clearTimesheetMatches(
  tenantId: string,
  options?: {
    dateFrom?: Date;
    dateTo?: Date;
  }
): Promise<number> {
  const { dateFrom, dateTo } = options || {};

  const whereClause: Prisma.TripRecordWhereInput = {
    tenant_id: tenantId,
    timesheet_id: { not: null },
  };

  if (dateFrom) {
    whereClause.departure_time = { gte: dateFrom };
  }

  if (dateTo) {
    whereClause.arrival_time = {
      ...(whereClause.arrival_time as Prisma.DateTimeFilter | undefined),
      lte: dateTo,
    };
  }

  const result = await prisma.tripRecord.updateMany({
    where: whereClause,
    data: { timesheet_id: null },
  });

  return result.count;
}

/**
 * Get matching statistics for a tenant
 */
export async function getMatchingStats(
  tenantId: string,
  options?: {
    dateFrom?: Date;
    dateTo?: Date;
  }
): Promise<{
  totalTrips: number;
  matchedTrips: number;
  unmatchedTrips: number;
  privateTrips: number;
  matchRate: number;
}> {
  const { dateFrom, dateTo } = options || {};

  const baseWhere: Prisma.TripRecordWhereInput = {
    tenant_id: tenantId,
  };

  if (dateFrom) {
    baseWhere.departure_time = { gte: dateFrom };
  }

  if (dateTo) {
    baseWhere.arrival_time = {
      ...(baseWhere.arrival_time as Prisma.DateTimeFilter | undefined),
      lte: dateTo,
    };
  }

  const [total, matched, privateTrips] = await Promise.all([
    prisma.tripRecord.count({ where: baseWhere }),
    prisma.tripRecord.count({
      where: { ...baseWhere, timesheet_id: { not: null } },
    }),
    prisma.tripRecord.count({
      where: { ...baseWhere, is_private: true },
    }),
  ]);

  const matchableTrips = total - privateTrips;
  const matchRate = matchableTrips > 0 ? (matched / matchableTrips) * 100 : 0;

  return {
    totalTrips: total,
    matchedTrips: matched,
    unmatchedTrips: matchableTrips - matched,
    privateTrips,
    matchRate: Math.round(matchRate * 10) / 10,
  };
}
