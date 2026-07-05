import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CapabilityManifestBuilder } from '../../src/capabilities/capability-manifest-builder.js';
import {
  negotiateCapabilities,
  negotiateProtocolVersion,
  parseClientCapabilityRequest,
} from '../../src/capabilities/capability-negotiation.js';
import { PROTOCOL_VERSION } from '../../src/capabilities/capability-manifest.constants.js';
import { resetEnvCache, getEnv } from '../../src/config/index.js';

describe('capability negotiation (D7.5-03)', () => {
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

  it('negotiates matching protocol version and required capabilities', () => {
    const manifest = new CapabilityManifestBuilder(getEnv()).build();
    const result = negotiateCapabilities(manifest, {
      protocolVersion: '1.0.0',
      requiredCapabilities: ['supportsMemoryCRUD', 'supportsContextBuilder'],
      preferredCapabilities: ['supportsHybridRetrieval'],
      transports: ['rest', 'mcp'],
      clientInfo: { name: 'test-client', version: '0.1.0' },
    });

    expect(result.compatible).toBe(true);
    expect(result.negotiatedProtocolVersion).toBe('1.0.0');
    expect(result.matched.required).toEqual([
      'supportsMemoryCRUD',
      'supportsContextBuilder',
    ]);
    expect(result.missing.required).toEqual([]);
    expect(result.matched.transports).toEqual(['rest', 'mcp']);
    expect(result.missing.preferred).toContain('supportsHybridRetrieval');
    expect(result.serverEnabledCapabilities).toContain('supportsMemoryCRUD');
  });

  it('marks incompatible when required capability is disabled', () => {
    vi.stubEnv('HYBRID_RETRIEVAL', 'false');
    vi.stubEnv('EMBEDDING_PROVIDER', 'noop');
    resetEnvCache();

    const manifest = new CapabilityManifestBuilder(getEnv()).build();
    const result = negotiateCapabilities(manifest, {
      requiredCapabilities: ['supportsHybridRetrieval'],
    });

    expect(result.compatible).toBe(false);
    expect(result.missing.required).toEqual(['supportsHybridRetrieval']);
  });

  it('rejects incompatible major protocol versions', () => {
    const negotiated = negotiateProtocolVersion('2.0.0', PROTOCOL_VERSION);
    expect(negotiated.compatible).toBe(false);
    expect(negotiated.negotiatedProtocolVersion).toBe(PROTOCOL_VERSION);
  });

  it('accepts same-major client protocol versions', () => {
    const negotiated = negotiateProtocolVersion('1.9.0', PROTOCOL_VERSION);
    expect(negotiated.compatible).toBe(true);
    expect(negotiated.negotiatedProtocolVersion).toBe(PROTOCOL_VERSION);
  });

  it('parses client capability request payloads safely', () => {
    const parsed = parseClientCapabilityRequest({
      protocolVersion: '1.0.0',
      requiredCapabilities: ['supportsMemoryCRUD'],
      clientInfo: { name: 'cursor', version: '1.0.0' },
      transports: ['mcp'],
      ignored: true,
    });

    expect(parsed).toEqual({
      protocolVersion: '1.0.0',
      requiredCapabilities: ['supportsMemoryCRUD'],
      clientInfo: { name: 'cursor', version: '1.0.0' },
      transports: ['mcp'],
    });
  });
});
