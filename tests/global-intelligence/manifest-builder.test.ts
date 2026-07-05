import { describe, it, expect, afterEach, vi } from 'vitest';
import { resetEnvCache, getEnv } from '../../src/config/index.js';
import { MockD1Client } from '../helpers/mock-d1.js';
import { GlobalIntelligenceManifestBuilder } from '../../src/intelligence/builders/global-intelligence-manifest-builder.js';
import { SqlIntelligenceStore } from '../../src/infrastructure/intelligence/sql-intelligence-store.js';

describe('Global intelligence manifest builder', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('builds capstone manifest with composed phases', async () => {
    vi.stubEnv('GLOBAL_INTELLIGENCE_PLATFORM_ENABLED', 'true');
    resetEnvCache();
    const store = new SqlIntelligenceStore(new MockD1Client());
    const builder = new GlobalIntelligenceManifestBuilder(getEnv(), store);
    const manifest = await builder.build({ ownerId: 'owner-1' });
    expect(manifest.platform).toBe('global-ai-intelligence');
    expect(manifest.enabled).toBe(true);
    expect(manifest.composedPhases).toContain('14-federation');
    expect(manifest.syncTiers.length).toBe(5);
  });
});
