import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CapabilityManifestBuilder } from '../../src/capabilities/capability-manifest-builder.js';
import { resetEnvCache, getEnv } from '../../src/config/index.js';

describe('Capability manifest — ecosystem section', () => {
  beforeEach(() => {
    vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'test-account');
    vi.stubEnv('D1_DATABASE_ID', 'test-database');
    vi.stubEnv('D1_API_TOKEN', 'test-token');
    vi.stubEnv('NODE_ENV', 'test');
    resetEnvCache();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('includes ecosystem block with 8+ clients', () => {
    const manifest = new CapabilityManifestBuilder(getEnv()).build();
    expect(manifest.capabilities.supportsAgentEcosystem).toBe(true);
    expect(manifest.ecosystem.clients.length).toBeGreaterThanOrEqual(8);
    expect(manifest.ecosystem.memoryCloud.sharedModel).toBe('workspace-scoped');
  });

  it('ecosystem clients match catalog count', () => {
    const manifest = new CapabilityManifestBuilder(getEnv()).build();
    const cursor = manifest.ecosystem.clients.find((c) => c.clientType === 'cursor');
    expect(cursor?.primaryProtocol).toBe('mcp-stdio');
  });
});
