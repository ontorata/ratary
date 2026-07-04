import { ValidationError } from '../types/errors.js';
import { KNOWN_CLIENT_PLATFORMS } from './client-sync.constants.js';
import type { ClientPlatformProfile } from './client-sync.types.js';
import type { IClientPlatformRegistry } from './iclient-platform-registry.interface.js';

export class DefaultClientPlatformRegistry implements IClientPlatformRegistry {
  private readonly platforms: Map<string, ClientPlatformProfile>;

  constructor(profiles: ClientPlatformProfile[] = KNOWN_CLIENT_PLATFORMS) {
    this.platforms = new Map(profiles.map((profile) => [profile.id.toLowerCase(), profile]));
  }

  list(): ClientPlatformProfile[] {
    return [...this.platforms.values()];
  }

  isKnown(platformId: string): boolean {
    return this.platforms.has(platformId.trim().toLowerCase());
  }

  assertKnown(platformId: string): void {
    if (!this.isKnown(platformId)) {
      throw new ValidationError(`Unknown client platform: ${platformId}`);
    }
  }
}
