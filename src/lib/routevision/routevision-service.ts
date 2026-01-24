/**
 * RouteVision Integratie Service
 *
 * Deze service simuleert de integratie met RouteVision voor GPS-verificatie van tijdregistraties.
 * Volgens de projectvereisten heeft RouteVision geen publieke API, dus we gebruiken data-export
 * en portal-integratie om de gegevens te verkrijgen.
 */

import { createLogger } from "@/lib/logger";

const logger = createLogger("RouteVision");

export interface RouteVisionJourney {
  driverId: string;
  vehicleId: string;
  journeyDate: string;
  startTime: string;
  endTime: string;
  startLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  endLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  waypoints: Array<{
    timestamp: string;
    latitude: number;
    longitude: number;
    address?: string;
  }>;
  totalDistance: number; // in kilometers
  businessTrip: boolean;
}

export interface WorkLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters, voor locatieverificatie
}

// Simuleer een lijst van bekende werklocaties
const workLocations: WorkLocation[] = [
  {
    id: "office-main",
    name: "Kantoor CKW",
    address: "Hoofdstraat 123, Amsterdam",
    latitude: 52.3676,
    longitude: 4.9041,
    radius: 50,
  },
  {
    id: "client-xyz",
    name: "Klant XYZ",
    address: "Keizersgracht 456, Amsterdam",
    latitude: 52.3702,
    longitude: 4.8952,
    radius: 30,
  },
  {
    id: "client-abc",
    name: "Klant ABC",
    address: "Herengracht 789, Amsterdam",
    latitude: 52.3731,
    longitude: 4.8896,
    radius: 40,
  },
];

// Simuleer RouteVision journeys (in een echte implementatie zou dit uit de RouteVision export komen)
const mockJourneys: RouteVisionJourney[] = [
  {
    driverId: "EMP001",
    vehicleId: "VEH001",
    journeyDate: "2025-07-18",
    startTime: "07:55:23",
    endTime: "17:03:45",
    startLocation: {
      latitude: 52.3676,
      longitude: 4.9041,
      address: "Hoofdstraat 123, Amsterdam",
    },
    endLocation: {
      latitude: 52.3676,
      longitude: 4.9041,
      address: "Hoofdstraat 123, Amsterdam",
    },
    waypoints: [
      {
        timestamp: "2025-07-18T07:55:23",
        latitude: 52.3676,
        longitude: 4.9041,
        address: "Hoofdstraat 123, Amsterdam",
      },
      {
        timestamp: "2025-07-18T12:30:15",
        latitude: 52.3731,
        longitude: 4.8896,
        address: "Herengracht 789, Amsterdam",
      },
      {
        timestamp: "2025-07-18T17:03:45",
        latitude: 52.3676,
        longitude: 4.9041,
        address: "Hoofdstraat 123, Amsterdam",
      },
    ],
    totalDistance: 12.5,
    businessTrip: true,
  },
  {
    driverId: "EMP001",
    vehicleId: "VEH001",
    journeyDate: "2025-07-17",
    startTime: "08:25:12",
    endTime: "16:35:27",
    startLocation: {
      latitude: 52.3676,
      longitude: 4.9041,
      address: "Hoofdstraat 123, Amsterdam",
    },
    endLocation: {
      latitude: 52.3702,
      longitude: 4.8952,
      address: "Keizersgracht 456, Amsterdam",
    },
    waypoints: [
      {
        timestamp: "2025-07-17T08:25:12",
        latitude: 52.3676,
        longitude: 4.9041,
        address: "Hoofdstraat 123, Amsterdam",
      },
      {
        timestamp: "2025-07-17T09:15:45",
        latitude: 52.3702,
        longitude: 4.8952,
        address: "Keizersgracht 456, Amsterdam",
      },
      {
        timestamp: "2025-07-17T16:35:27",
        latitude: 52.3702,
        longitude: 4.8952,
        address: "Keizersgracht 456, Amsterdam",
      },
    ],
    totalDistance: 8.3,
    businessTrip: true,
  },
];

/**
 * Berekent de afstand tussen twee GPS-coördinaten in meters
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // aarde radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return d; // in meters
}

/**
 * Controleert of een GPS-coördinaat binnen een werklocatie valt
 */
function isWithinWorkLocation(
  latitude: number,
  longitude: number,
  location: WorkLocation
): boolean {
  const distance = calculateDistance(
    latitude,
    longitude,
    location.latitude,
    location.longitude
  );
  return distance <= location.radius;
}

/**
 * Zoekt de werklocatie op basis van GPS-coördinaten
 */
function findWorkLocation(
  latitude: number,
  longitude: number
): WorkLocation | null {
  for (const location of workLocations) {
    if (isWithinWorkLocation(latitude, longitude, location)) {
      return location;
    }
  }
  return null;
}

/**
 * Converteert een RouteVision journey naar een tijdregistratie
 */
export function journeyToTimesheet(
  journey: RouteVisionJourney,
  employeeId: string
) {
  // Controleer of de start- en eindlocatie bekende werklocaties zijn
  const startWorkLocation = findWorkLocation(
    journey.startLocation.latitude,
    journey.startLocation.longitude
  );
  const endWorkLocation = findWorkLocation(
    journey.endLocation.latitude,
    journey.endLocation.longitude
  );

  // Bepaal of de locaties geverifieerd zijn
  const startLocationVerified = startWorkLocation !== null;
  const endLocationVerified = endWorkLocation !== null;
  const locationVerified = startLocationVerified && endLocationVerified;

  return {
    employeeId,
    date: journey.journeyDate,
    startTime: journey.startTime,
    endTime: journey.endTime,
    locationVerified,
    startLocation: startWorkLocation ? startWorkLocation.name : journey.startLocation.address,
    endLocation: endWorkLocation ? endWorkLocation.name : journey.endLocation.address,
    totalDistance: journey.totalDistance,
    businessTrip: journey.businessTrip,
  };
}

/**
 * Haalt journeys op voor een specifieke werknemer en datum
 */
export async function getJourneysForEmployee(
  employeeId: string,
  date?: string
): Promise<RouteVisionJourney[]> {
  // In een echte implementatie zou dit een API-aanroep of data-import zijn
  // Nu simuleren we dit met de mock data
  
  // Filter op employeeId (in dit geval driverId) en optioneel op datum
  return mockJourneys.filter(
    (journey) =>
      journey.driverId === employeeId &&
      (!date || journey.journeyDate === date)
  );
}

/**
 * Verifieert een tijdregistratie met RouteVision GPS-gegevens
 */
export async function verifyTimesheetWithGPS(
  employeeId: string,
  date: string,
  startTime: string,
  endTime: string
): Promise<{
  verified: boolean;
  startLocationVerified: boolean;
  endLocationVerified: boolean;
  startLocation?: string;
  endLocation?: string;
}> {
  try {
    // Haal journeys op voor de werknemer en datum
    const journeys = await getJourneysForEmployee(employeeId, date);
    
    if (journeys.length === 0) {
      return {
        verified: false,
        startLocationVerified: false,
        endLocationVerified: false,
      };
    }

    // Zoek de journey die overeenkomt met de tijdregistratie
    // In een echte implementatie zou dit nauwkeuriger zijn
    const matchingJourney = journeys.find(
      (journey) =>
        // Controleer of de tijden ongeveer overeenkomen (binnen 15 minuten)
        Math.abs(
          new Date(`${date}T${journey.startTime}`).getTime() -
            new Date(`${date}T${startTime}`).getTime()
        ) <=
          15 * 60 * 1000 &&
        Math.abs(
          new Date(`${date}T${journey.endTime}`).getTime() -
            new Date(`${date}T${endTime}`).getTime()
        ) <=
          15 * 60 * 1000
    );

    if (!matchingJourney) {
      return {
        verified: false,
        startLocationVerified: false,
        endLocationVerified: false,
      };
    }

    // Controleer of de start- en eindlocatie bekende werklocaties zijn
    const startWorkLocation = findWorkLocation(
      matchingJourney.startLocation.latitude,
      matchingJourney.startLocation.longitude
    );
    const endWorkLocation = findWorkLocation(
      matchingJourney.endLocation.latitude,
      matchingJourney.endLocation.longitude
    );

    // Bepaal of de locaties geverifieerd zijn
    const startLocationVerified = startWorkLocation !== null;
    const endLocationVerified = endWorkLocation !== null;
    const verified = startLocationVerified && endLocationVerified;

    return {
      verified,
      startLocationVerified,
      endLocationVerified,
      startLocation: startWorkLocation
        ? startWorkLocation.name
        : matchingJourney.startLocation.address,
      endLocation: endWorkLocation
        ? endWorkLocation.name
        : matchingJourney.endLocation.address,
    };
  } catch (error) {
    logger.error("Error verifying timesheet with GPS", error);
    return {
      verified: false,
      startLocationVerified: false,
      endLocationVerified: false,
    };
  }
}

/**
 * Haalt alle bekende werklocaties op
 */
export function getWorkLocations(): WorkLocation[] {
  return workLocations;
}
