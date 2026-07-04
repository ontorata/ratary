import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CapabilityManifestBuilder } from '../../src/capabilities/capability-manifest-builder.js';
import { MCP_TOOL_NAMES } from '../../src/capabilities/mcp-tool-names.js';
import { resetEnvCache, getEnv } from '../../src/config/index.js';

describe('CapabilityManifestBuilder', () => {
  beforeEach(() => {
    vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'test-account');
    vi.stubEnv('D1_DATABASE_ID', 'test-database');
    vi.stubEnv('D1_API_TOKEN', 'test-token');
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('SQL_PROVIDER', 'd1');
    resetEnvCache();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('reflects default D1 deployment with hybrid and graph off', () => {
    vi.stubEnv('HYBRID_RETRIEVAL', 'false');
    vi.stubEnv('GRAPH_RETRIEVAL', 'false');
    vi.stubEnv('EMBEDDING_PROVIDER', 'noop');
    resetEnvCache();

    const manifest = new CapabilityManifestBuilder(getEnv()).build();

    expect(manifest.protocolVersion).toBe('1.0.0');
    expect(manifest.capabilities.supportsHybridRetrieval).toBe(false);
    expect(manifest.capabilities.supportsEmbedding).toBe(false);
    expect(manifest.capabilities.supportsSemanticCompression).toBe(false);
    expect(manifest.capabilities.supportsQualitySignals).toBe(false);
    expect(manifest.capabilities.supportsLearningEngine).toBe(false);
    expect(manifest.capabilities.supportsRelationInference).toBe(false);
    expect(manifest.capabilities.supportsMemoryEvolution).toBe(false);
    expect(manifest.deployment.sqlProvider).toBe('d1');
    expect(manifest.retrieval.defaultContentMode).toBe('summary');
  });

  it('enables hybrid retrieval when env flags are on', () => {
    vi.stubEnv('HYBRID_RETRIEVAL', 'true');
    vi.stubEnv('EMBEDDING_PROVIDER', 'openai');
    vi.stubEnv('EMBEDDING_API_KEY', 'sk-test');
    resetEnvCache();

    const manifest = new CapabilityManifestBuilder(getEnv()).build();

    expect(manifest.capabilities.supportsHybridRetrieval).toBe(true);
    expect(manifest.capabilities.supportsSemanticSearch).toBe(true);
    expect(manifest.capabilities.supportsEmbedding).toBe(true);
  });

  it('lists MCP tools matching canonical registry', () => {
    const manifest = new CapabilityManifestBuilder(getEnv()).build();

    expect(manifest.mcp.toolCount).toBe(MCP_TOOL_NAMES.length);
    expect(manifest.mcp.toolNames).toEqual([...MCP_TOOL_NAMES]);
    expect(manifest.mcp.transport).toBe('stdio');
  });

  it('includes standard error codes and rate limits', () => {
    const manifest = new CapabilityManifestBuilder(getEnv()).build();

    expect(manifest.errorCodes.map((item) => item.code)).toContain('NOT_FOUND');
    expect(manifest.rateLimits.some((item) => item.capabilityGroup.includes('Memory CRUD'))).toBe(
      true,
    );
  });
});
