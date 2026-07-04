import { describe, it, expect } from 'vitest';
import { DefaultClientPlatformRegistry } from '../../src/client-sync/default-client-platform-registry.js';
import { ValidationError } from '../../src/types/errors.js';

describe('DefaultClientPlatformRegistry', () => {
  it('lists known AI client platforms', () => {
    const registry = new DefaultClientPlatformRegistry();
    const platforms = registry.list();

    expect(platforms.length).toBeGreaterThanOrEqual(9);
    expect(platforms.some((p) => p.id === 'cursor')).toBe(true);
    expect(platforms.some((p) => p.id === 'mcp')).toBe(true);
  });

  it('recognizes known platform ids case-insensitively', () => {
    const registry = new DefaultClientPlatformRegistry();

    expect(registry.isKnown('Cursor')).toBe(true);
    expect(registry.isKnown('MCP')).toBe(true);
    expect(registry.isKnown('unknown-client')).toBe(false);
  });

  it('throws ValidationError for unknown platforms', () => {
    const registry = new DefaultClientPlatformRegistry();

    expect(() => registry.assertKnown('unknown-client')).toThrow(ValidationError);
  });
});
