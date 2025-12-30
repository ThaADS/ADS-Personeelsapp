/**
 * Fleet Providers - Main Export
 *
 * Central export for all fleet tracking provider implementations
 */

// Types
export * from './types';

// Base provider
export { BaseFleetProvider } from './base-provider';

// Provider implementations
export { RouteVisionProvider } from './routevision-provider';
export { FleetGoProvider } from './fleetgo-provider';
export { SamsaraProvider } from './samsara-provider';
export { WebfleetProvider } from './webfleet-provider';
export { TrackJackProvider } from './trackjack-provider';
export { VerizonProvider } from './verizon-provider';

// Provider factory
import { FleetProviderType, IFleetProvider, FLEET_PROVIDERS } from './types';
import { RouteVisionProvider } from './routevision-provider';
import { FleetGoProvider } from './fleetgo-provider';
import { SamsaraProvider } from './samsara-provider';
import { WebfleetProvider } from './webfleet-provider';
import { TrackJackProvider } from './trackjack-provider';
import { VerizonProvider } from './verizon-provider';

/**
 * Factory function to create provider instance by type
 */
export function createFleetProvider(providerType: FleetProviderType): IFleetProvider {
  switch (providerType) {
    case 'routevision':
      return new RouteVisionProvider();
    case 'fleetgo':
      return new FleetGoProvider();
    case 'samsara':
      return new SamsaraProvider();
    case 'webfleet':
      return new WebfleetProvider();
    case 'trackjack':
      return new TrackJackProvider();
    case 'verizon':
      return new VerizonProvider();
    default:
      throw new Error(`Unknown provider type: ${providerType}`);
  }
}

/**
 * Get all available providers (for UI listing)
 */
export function getAvailableProviders() {
  return Object.values(FLEET_PROVIDERS).sort((a, b) => {
    // Sort by popularity first, then by name
    if (a.popular !== b.popular) return a.popular ? -1 : 1;
    return a.displayName.localeCompare(b.displayName);
  });
}

/**
 * Get provider info by type
 */
export function getProviderInfo(providerType: FleetProviderType) {
  return FLEET_PROVIDERS[providerType];
}
