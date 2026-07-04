import { describe, it, expect, afterEach, vi } from 'vitest';
import { resetEnvCache, getEnv } from '../../src/config/index.js';
import { MockD1Client } from '../helpers/mock-d1.js';
import { createInfrastructurePlatformPorts } from '../../src/composition/create-infrastructure-platform-ports.js';

describe('Infrastructure platform ports composition', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('returns disabled ports when PLUGIN_MARKETPLACE_ENABLED=false', async () => {
    vi.stubEnv('PLUGIN_MARKETPLACE_ENABLED', 'false');
    resetEnvCache();
    const ports = await createInfrastructurePlatformPorts(new MockD1Client(), getEnv());
    expect(ports.enabled).toBe(false);
    expect(await ports.pluginRegistry.list()).toEqual([]);
  });

  it('returns enabled ports with bootstrapped registry when PLUGIN_MARKETPLACE_ENABLED=true', async () => {
    vi.stubEnv('PLUGIN_MARKETPLACE_ENABLED', 'true');
    resetEnvCache();
    const ports = await createInfrastructurePlatformPorts(new MockD1Client(), getEnv());
    expect(ports.enabled).toBe(true);
    const plugins = await ports.pluginRegistry.list();
    expect(plugins.length).toBeGreaterThanOrEqual(9);
    const catalog = await ports.marketplace.getCatalog();
    expect(catalog.entries.length).toBe(9);
  });
});
