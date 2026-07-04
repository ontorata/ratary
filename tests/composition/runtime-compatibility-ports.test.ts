import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createRuntimeCompatibilityPorts } from '../../src/composition/create-runtime-compatibility-ports.js';
import { MCP_TOOL_NAMES } from '../../src/capabilities/mcp-tool-names.js';
import { getEnv, resetEnvCache } from '../../src/config/index.js';

describe('createRuntimeCompatibilityPorts (Phase 7.5)', () => {
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

  it('builds manifest with deployment-accurate flags', () => {
    vi.stubEnv('HYBRID_RETRIEVAL', 'false');
    vi.stubEnv('COMPRESSION_ENABLED', 'false');
    resetEnvCache();

    const manifest = createRuntimeCompatibilityPorts(getEnv()).buildManifest();
    expect(manifest.protocolVersion).toBeTruthy();
    expect(manifest.mcp.toolCount).toBe(MCP_TOOL_NAMES.length);
    expect(manifest.capabilities.supportsHybridRetrieval).toBe(false);
    expect(manifest.capabilities.supportsProgressiveRetrieval).toBe(true);
  });

  it('accepts openApiUrl override', () => {
    const manifest = createRuntimeCompatibilityPorts(getEnv()).buildManifest({
      openApiUrl: 'https://example.com/docs/json',
    });
    expect(manifest.rest.openApiUrl).toBe('https://example.com/docs/json');
  });
});
