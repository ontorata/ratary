import { describe, it, expect, afterEach, vi } from 'vitest';
import { assertMcpOwnerConfigured, getMcpMemoryScope } from '../../src/types/memory-scope.js';

describe('memory-scope', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should allow empty owner in test environment', () => {
    vi.stubEnv('NODE_ENV', 'test');
    expect(() => assertMcpOwnerConfigured()).not.toThrow();
    expect(getMcpMemoryScope().ownerId).toBe('');
  });

  it('should require MCP_OWNER_ID in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('MCP_OWNER_ID', '');
    expect(() => assertMcpOwnerConfigured()).toThrow(/MCP_OWNER_ID is required/);
  });

  it('should return configured owner in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('MCP_OWNER_ID', 'owner-prod-1');
    expect(getMcpMemoryScope()).toEqual({ ownerId: 'owner-prod-1' });
  });
});
