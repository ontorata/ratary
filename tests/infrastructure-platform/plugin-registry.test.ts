import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { resetEnvCache, getEnv } from '../../src/config/index.js';
import { SchemaPluginManifestValidator } from '../../src/infrastructure-platform/adapters/schema-plugin-manifest-validator.js';
import { InMemoryPluginRegistry } from '../../src/infrastructure/infrastructure-platform/sql-plugin-registry.js';
import type { PluginManifest } from '../../src/infrastructure-platform/types/plugin.types.js';

const storageA: PluginManifest = {
  id: 'storage-d1',
  version: '1.0.0',
  type: 'storage',
  displayName: 'D1',
  implements: 'ISqlDatabase',
  envAdapterKey: 'SQL_PROVIDER',
  envAdapterValue: 'd1',
};

const storageB: PluginManifest = {
  id: 'storage-postgres',
  version: '1.0.0',
  type: 'storage',
  displayName: 'Postgres',
  implements: 'ISqlDatabase',
  envAdapterKey: 'SQL_PROVIDER',
  envAdapterValue: 'postgres',
};

describe('InMemoryPluginRegistry', () => {
  let registry: InMemoryPluginRegistry;

  beforeEach(() => {
    vi.stubEnv('SQL_PROVIDER', 'd1');
    resetEnvCache();
    registry = new InMemoryPluginRegistry(getEnv(), new SchemaPluginManifestValidator());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetEnvCache();
  });

  it('registers and retrieves a plugin', async () => {
    const plugin = await registry.register({ manifest: storageA });
    expect(plugin.manifest.id).toBe('storage-d1');
    expect(plugin.status).toBe('registered');
    expect(await registry.get('storage-d1')).not.toBeNull();
  });

  it('enables one plugin per type and disables siblings', async () => {
    await registry.register({ manifest: storageA });
    await registry.register({ manifest: storageB });
    await registry.enable('storage-d1');
    await registry.enable('storage-postgres');

    const d1 = await registry.get('storage-d1');
    const pg = await registry.get('storage-postgres');
    expect(d1?.status).toBe('disabled');
    expect(pg?.status).toBe('enabled');
  });

  it('bootstrapFromEnv seeds catalog plugins', async () => {
    await registry.bootstrapFromEnv();
    const plugins = await registry.list();
    expect(plugins.length).toBeGreaterThanOrEqual(9);
    const storageActive = await registry.getActivePluginId('storage');
    expect(storageActive).toBe('storage-d1');
  });
});
