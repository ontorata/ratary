import type { ClientPlatformProfile } from './client-sync.types.js';

/** Registry of known AI client platforms and their sync profiles. */
export interface IClientPlatformRegistry {
  list(): ClientPlatformProfile[];
  isKnown(platformId: string): boolean;
  assertKnown(platformId: string): void;
}
