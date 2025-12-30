/**
 * Fleet Provider Types
 *
 * Common types and interfaces for all fleet tracking providers
 */

// Supported provider types
export type FleetProviderType =
  | 'routevision'
  | 'fleetgo'
  | 'samsara'
  | 'webfleet'
  | 'trackjack'
  | 'verizon';

// Provider metadata for UI
export interface FleetProviderInfo {
  id: FleetProviderType;
  name: string;
  displayName: string;
  description: string;
  logo: string; // SVG path or URL
  website: string;
  features: string[];
  authType: 'credentials' | 'api_key' | 'oauth2';
  country: 'nl' | 'eu' | 'global';
  popular: boolean;
}

// Common vehicle interface
export interface FleetVehicle {
  id: string;
  registration: string; // License plate
  name?: string;
  brand?: string;
  model?: string;
  isActive: boolean;
  providerId: string;
  providerType: FleetProviderType;
}

// Common trip interface
export interface FleetTrip {
  id: string;
  vehicleId: string;
  registration: string;
  driverName?: string;

  departureTime: Date;
  arrivalTime: Date;
  distanceKm: number;
  durationMinutes: number;

  // Departure location
  departure: {
    street?: string;
    houseNumber?: string;
    postalCode?: string;
    city?: string;
    address: string;
    lat?: number;
    lng?: number;
  };

  // Arrival location
  arrival: {
    street?: string;
    houseNumber?: string;
    postalCode?: string;
    city?: string;
    address: string;
    lat?: number;
    lng?: number;
  };

  // Trip flags
  isPrivate: boolean;
  isCommute: boolean;
  isManual: boolean;
  isRunning: boolean;

  providerId: string;
  providerType: FleetProviderType;
}

// Common vehicle location interface
export interface FleetVehicleLocation {
  vehicleId: string;
  registration: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  timestamp: Date;
  address?: string;
  isIgnitionOn: boolean;
  providerType: FleetProviderType;
}

// Provider credentials interface
export interface FleetProviderCredentials {
  providerType: FleetProviderType;
  // Credentials auth
  email?: string;
  password?: string;
  // API key auth
  apiKey?: string;
  apiSecret?: string;
  // OAuth2 auth
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: Date;
  // Custom fields per provider
  customFields?: Record<string, string>;
}

// Provider connection test result
export interface ConnectionTestResult {
  success: boolean;
  vehicleCount?: number;
  error?: string;
  providerVersion?: string;
}

// Sync result
export interface SyncResult {
  success: boolean;
  synced: number;
  skipped: number;
  errors: string[];
  dateRange: {
    from: Date;
    to: Date;
  };
}

// Abstract provider interface
export interface IFleetProvider {
  readonly providerType: FleetProviderType;
  readonly info: FleetProviderInfo;

  // Authentication
  authenticate(credentials: FleetProviderCredentials): Promise<string>; // Returns token/session
  testConnection(credentials: FleetProviderCredentials): Promise<ConnectionTestResult>;

  // Data retrieval
  getVehicles(token: string): Promise<FleetVehicle[]>;
  getTrips(token: string, vehicleId: string, dateFrom: Date, dateTo: Date): Promise<FleetTrip[]>;
  getVehicleLocations(token: string): Promise<FleetVehicleLocation[]>;
}

// Provider registry
export const FLEET_PROVIDERS: Record<FleetProviderType, FleetProviderInfo> = {
  routevision: {
    id: 'routevision',
    name: 'routevision',
    displayName: 'RouteVision',
    description: 'Nederlandse ritregistratie specialist met uitgebreide rapportage mogelijkheden',
    logo: '/images/providers/routevision.svg',
    website: 'https://routevision.com',
    features: ['Ritregistratie', 'GPS Tracking', 'Kilometeradministratie', 'Fiscale rapportages'],
    authType: 'credentials',
    country: 'nl',
    popular: true,
  },
  fleetgo: {
    id: 'fleetgo',
    name: 'fleetgo',
    displayName: 'FleetGO',
    description: 'Moderne fleet management met real-time tracking en eco-driving scores',
    logo: '/images/providers/fleetgo.svg',
    website: 'https://fleetgo.com',
    features: ['Fleet Management', 'Eco-Driving', 'Real-time Tracking', 'Onderhoudsbeheer'],
    authType: 'api_key',
    country: 'nl',
    popular: true,
  },
  samsara: {
    id: 'samsara',
    name: 'samsara',
    displayName: 'Samsara',
    description: 'Enterprise fleet management platform met AI-powered dashcams en IoT sensoren',
    logo: '/images/providers/samsara.svg',
    website: 'https://samsara.com',
    features: ['AI Dashcams', 'IoT Sensoren', 'Route Optimalisatie', 'Compliance'],
    authType: 'api_key',
    country: 'global',
    popular: true,
  },
  webfleet: {
    id: 'webfleet',
    name: 'webfleet',
    displayName: 'Webfleet (TomTom)',
    description: 'TomTom\'s professionele fleet management met navigatie integratie',
    logo: '/images/providers/webfleet.svg',
    website: 'https://webfleet.com',
    features: ['TomTom Navigatie', 'OptiDrive 360', 'Werkorder Management', 'API Integraties'],
    authType: 'credentials',
    country: 'eu',
    popular: true,
  },
  trackjack: {
    id: 'trackjack',
    name: 'trackjack',
    displayName: 'TrackJack',
    description: 'Betaalbare ritregistratie voor MKB met eenvoudige fiscale export',
    logo: '/images/providers/trackjack.svg',
    website: 'https://trackjack.nl',
    features: ['Ritregistratie', 'Fiscale Export', 'MKB Vriendelijk', 'Lage Kosten'],
    authType: 'credentials',
    country: 'nl',
    popular: false,
  },
  verizon: {
    id: 'verizon',
    name: 'verizon',
    displayName: 'Verizon Connect',
    description: 'Enterprise fleet management met uitgebreide analytics en integraties',
    logo: '/images/providers/verizon.svg',
    website: 'https://verizonconnect.com',
    features: ['Enterprise Analytics', 'Field Service', 'Asset Tracking', 'Video Telematics'],
    authType: 'api_key',
    country: 'global',
    popular: false,
  },
};
