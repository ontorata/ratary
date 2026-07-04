import { describe, it, expect } from 'vitest';
import { InMemoryWebhookSubscriptionStore } from '../../src/infrastructure/ai-brain-platform/sql-webhook-subscription-store.js';
import { AiBrainPlatformManifestBuilder } from '../../src/ai-brain-platform/builders/ai-brain-platform-manifest-builder.js';
import { getEnv } from '../../src/config/index.js';

describe('AiBrainPlatformManifestBuilder', () => {
  it('builds umbrella manifest with planes', async () => {
    const store = new InMemoryWebhookSubscriptionStore();
    const builder = new AiBrainPlatformManifestBuilder(getEnv(), store);
    const manifest = await builder.build({ ownerId: 'owner-1' });

    expect(manifest.platform).toBe('ai-brain-platform');
    expect(manifest.edition).toBe('core');
    expect(manifest.planes.length).toBeGreaterThan(0);
    expect(manifest.composedPhases).toContain('16-developer');
  });
});
