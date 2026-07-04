import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CapabilityManifestBuilder } from '../../src/capabilities/capability-manifest-builder.js';
import {
  buildCondensedCapabilityManifest,
  CONDENSED_CAPABILITY_FLAG_KEYS,
} from '../../src/capabilities/condensed-capability-manifest.js';
import { MCP_TOOL_NAMES } from '../../src/capabilities/mcp-tool-names.js';
import { resetEnvCache, getEnv } from '../../src/config/index.js';

describe('buildCondensedCapabilityManifest', () => {
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

  it('includes protocolVersion, toolCount, manifest URL, limits, and key flags', () => {
    vi.stubEnv('HYBRID_RETRIEVAL', 'true');
    vi.stubEnv('EMBEDDING_PROVIDER', 'openai');
    vi.stubEnv('EMBEDDING_API_KEY', 'sk-test');
    vi.stubEnv('GRAPH_RETRIEVAL', 'true');
    resetEnvCache();

    const manifest = new CapabilityManifestBuilder(getEnv()).build();
    const condensed = buildCondensedCapabilityManifest(manifest);

    expect(condensed.protocolVersion).toBe('1.0.0');
    expect(condensed.mcp.toolCount).toBe(MCP_TOOL_NAMES.length);
    expect(condensed.mcp.transport).toBe('stdio');
    expect(condensed.capabilitiesUrl).toBe('/api/v1/capabilities');
    expect(condensed.enabledCapabilities).toContain('supportsHybridRetrieval');
    expect(condensed.enabledCapabilities).toContain('supportsKnowledgeGraph');
    expect(condensed.limits.maxResultsPerSearch).toBeGreaterThan(0);
    expect(condensed.retrieval.defaultContentMode).toBe('summary');
    expect(
      condensed.enabledCapabilities.every((flag) =>
        CONDENSED_CAPABILITY_FLAG_KEYS.includes(
          flag as (typeof CONDENSED_CAPABILITY_FLAG_KEYS)[number],
        ),
      ),
    ).toBe(true);
  });

  it('allows remote transport override', () => {
    const manifest = new CapabilityManifestBuilder(getEnv()).build();
    const condensed = buildCondensedCapabilityManifest(manifest, {
      mcpTransport: 'streamable-http',
      capabilitiesUrl: 'https://host.example/api/v1/capabilities',
    });

    expect(condensed.mcp.transport).toBe('streamable-http');
    expect(condensed.capabilitiesUrl).toBe('https://host.example/api/v1/capabilities');
  });
});
