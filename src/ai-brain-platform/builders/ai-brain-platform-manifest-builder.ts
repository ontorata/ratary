import type { Env } from '../../config/env.js';
import type { IWebhookSubscriptionStore } from '../ports/iwebhook-subscription-store.port.js';
import type {
  AiBrainPlatformManifest,
  PlatformEdition,
  PlatformPlaneStatus,
} from '../types/platform.types.js';
import type { MemoryScope } from '../../types/memory-scope.js';

const COMPOSED_PHASES = [
  '10.5-transport',
  '12-event-pipeline',
  '13-protocol',
  '14-federation',
  '16-developer',
  '18-cloud',
  '19-observability',
  '20-ai-infrastructure',
  '23-knowledge-fabric',
] as const;

function editionIncludes(edition: PlatformEdition, min: PlatformEdition): boolean {
  const order: PlatformEdition[] = ['core', 'standard', 'enterprise'];
  return order.indexOf(edition) >= order.indexOf(min);
}

export class AiBrainPlatformManifestBuilder {
  constructor(
    private readonly env: Env,
    private readonly webhookStore: IWebhookSubscriptionStore,
  ) {}

  async build(scope?: MemoryScope): Promise<AiBrainPlatformManifest> {
    const edition = this.env.AI_BRAIN_PLATFORM_EDITION;
    const webhookCount = scope ? await this.webhookStore.countActive(scope) : 0;

    const planes: PlatformPlaneStatus[] = [
      {
        id: 'developer',
        label: 'Developer plane',
        enabled: true,
        availableInEdition: editionIncludes(edition, 'core'),
      },
      {
        id: 'protocol',
        label: 'Protocol plane',
        enabled:
          this.env.SSE_ENABLED ||
          this.env.WEBSOCKET_ENABLED ||
          this.env.GRPC_ENABLED ||
          this.env.REMOTE_MCP_ENABLED,
        availableInEdition: editionIncludes(edition, 'standard'),
      },
      {
        id: 'events',
        label: 'Event pipeline',
        enabled: this.env.EVENT_CONSUMERS_ENABLED,
        availableInEdition: editionIncludes(edition, 'standard'),
      },
      {
        id: 'extension',
        label: 'Extension / marketplace',
        enabled: this.env.PLUGIN_MARKETPLACE_ENABLED,
        availableInEdition: editionIncludes(edition, 'enterprise'),
      },
      {
        id: 'deployment',
        label: 'Deployment / cloud',
        enabled: this.env.CONTROL_PLANE_ENABLED,
        availableInEdition: editionIncludes(edition, 'enterprise'),
      },
      {
        id: 'knowledge',
        label: 'Knowledge fabric',
        enabled: this.env.KNOWLEDGE_FABRIC_ENABLED,
        availableInEdition: editionIncludes(edition, 'enterprise'),
      },
      {
        id: 'webhooks',
        label: 'Outbound webhooks',
        enabled: this.env.PLATFORM_WEBHOOKS_ENABLED,
        availableInEdition: editionIncludes(edition, 'enterprise'),
      },
    ];

    return {
      platform: 'ai-brain-platform',
      edition,
      planes,
      webhooksEnabled: this.env.PLATFORM_WEBHOOKS_ENABLED,
      activeWebhookCount: webhookCount,
      composedPhases: [...COMPOSED_PHASES],
    };
  }
}
