import { describe, it, expect } from 'vitest';
import { CapabilityManifestBuilder } from '../../src/capabilities/capability-manifest-builder.js';
import { MCP_TOOL_NAMES } from '../../src/capabilities/mcp-tool-names.js';
import { STANDARD_ERROR_CODES } from '../../src/capabilities/capability-manifest.constants.js';
import type { Env } from '../../src/config/env.js';

const baseEnv = {
  NODE_ENV: 'test',
  PORT: 3000,
  LOG_LEVEL: 'info',
  EMBEDDING_PROVIDER: 'noop',
  EMBEDDING_MODEL: 'text-embedding-3-small',
  EMBEDDING_BASE_URL: 'https://api.openai.com/v1',
  EMBEDDING_BATCH_SIZE: 32,
  EMBEDDING_MAX_RETRIES: 3,
  HYBRID_RETRIEVAL: false,
  GRAPH_RETRIEVAL: false,
  GRAPH_MAX_DEPTH: 3,
  GRAPH_SEED_CAP: 5,
  GRAPH_MAX_NEIGHBORS: 20,
  SQL_PROVIDER: 'd1',
  VECTOR_PROVIDER: 'd1',
  OBJECT_STORAGE_PROVIDER: 'inline',
  S3_FORCE_PATH_STYLE: false,
  CACHE_PROVIDER: 'none',
  REDIS_KEY_PREFIX: 'ai-brain:cache:',
  EVENT_BUS_PROVIDER: 'none',
  REDIS_STREAM_PREFIX: 'ai-brain:events:',
  REDIS_STREAM_CONSUMER_GROUP: 'ai-brain-consumers',
  REDIS_STREAM_CONSUMER_NAME: 'ai-brain-worker',
  ANALYTICS_PROVIDER: 'none',
  DUCKDB_PATH: ':memory:',
  GRAPH_PROVIDER: 'd1',
  SEARCH_PROVIDER: 'sql',
  OTEL_ENABLED: false,
  OTEL_SERVICE_NAME: 'ai-memory-cloud',
  OTEL_EXPORTER_OTLP_ENDPOINT: 'http://127.0.0.1:4318/v1/traces',
  ENTERPRISE_RBAC: false,
  MEMORY_ACCESS_AUDIT: false,
  GRPC_ENABLED: false,
  GRPC_PORT: 50051,
  GRPC_HOST: '0.0.0.0',
} as Env;

describe('Capability manifest contract', () => {
  it('tool registry parity with MCP_TOOL_NAMES', () => {
    const manifest = new CapabilityManifestBuilder(baseEnv).build();

    expect(manifest.mcp.toolCount).toBe(MCP_TOOL_NAMES.length);
    expect([...manifest.mcp.toolNames].sort()).toEqual([...MCP_TOOL_NAMES].sort());
    expect(manifest.mcp.toolNames).toContain('get_capabilities');
  });

  it('required manifest fields are present', () => {
    const manifest = new CapabilityManifestBuilder(baseEnv).build();

    expect(manifest.protocolVersion).toBeTruthy();
    expect(manifest.capabilities.supportsMemoryCRUD).toBe(true);
    expect(manifest.capabilities.supportsOwnerScope).toBe(true);
    expect(manifest.limits.maxContextTokens).toBeGreaterThan(0);
    expect(manifest.errorCodes.length).toBe(STANDARD_ERROR_CODES.length);
    expect(manifest.rest.version).toBe('v1');
    expect(manifest.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('transport section reports REST, MCP, gRPC (off), and SDK (Phase 10.5F)', () => {
    const manifest = new CapabilityManifestBuilder(baseEnv).build();

    expect(manifest.transport.rest).toEqual({ enabled: true, version: 'v1', baseUrl: '/api/v1' });
    expect(manifest.transport.mcp).toEqual({
      enabled: true,
      transport: 'stdio',
      toolCount: MCP_TOOL_NAMES.length,
    });
    expect(manifest.transport.grpc.enabled).toBe(false);
    expect(manifest.transport.grpc.port).toBeUndefined();
    expect(manifest.transport.sdk).toEqual({ packageName: '@ai-brain/client', status: 'planned' });
  });

  it('transport section surfaces gRPC when GRPC_ENABLED', () => {
    const manifest = new CapabilityManifestBuilder({
      ...baseEnv,
      GRPC_ENABLED: true,
      GRPC_PORT: 50123,
    } as Env).build();

    expect(manifest.transport.grpc.enabled).toBe(true);
    expect(manifest.transport.grpc.port).toBe(50123);
    expect(manifest.transport.grpc.protoVersion).toBe('v1');
  });
});
