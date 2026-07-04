import type { Env } from '../../config/env.js';
import type { MemoryScope } from '../../types/memory-scope.js';
import type { IIntelligenceStore } from '../sync/ports/iglobal-sync.port.js';
import type { GlobalIntelligencePlatformManifest } from '../sync/types/sync.types.js';
import { SYNC_TIERS } from '../sync/types/sync.types.js';

const COMPOSED_PHASES = [
  '12-event-pipeline',
  '14-federation',
  '18-cloud',
  '19-observability',
  '20-ai-infrastructure',
  '23-knowledge-fabric',
  '24-ai-brain-platform',
] as const;

export class GlobalIntelligenceManifestBuilder {
  constructor(
    private readonly env: Env,
    private readonly store: IIntelligenceStore & { countAllTelemetry?: () => Promise<number> },
  ) {}

  async build(_scope?: MemoryScope): Promise<GlobalIntelligencePlatformManifest> {
    const telemetryEventCount =
      typeof this.store.countAllTelemetry === 'function'
        ? await this.store.countAllTelemetry()
        : 0;

    return {
      platform: 'global-ai-intelligence',
      enabled: this.env.GLOBAL_INTELLIGENCE_PLATFORM_ENABLED,
      telemetryEnabled: this.env.GLOBAL_INTELLIGENCE_PLATFORM_ENABLED,
      analyticsEnabled: this.env.GLOBAL_INTELLIGENCE_PLATFORM_ENABLED,
      syncEnabled: this.env.GLOBAL_INTELLIGENCE_PLATFORM_ENABLED && this.env.FEDERATION_ENABLED,
      composedPhases: [...COMPOSED_PHASES],
      syncTiers: [...SYNC_TIERS],
      telemetryEventCount,
    };
  }
}
