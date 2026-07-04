import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import { nowISO } from '../../utils/memory-mapper.js';
import { NotFoundError, ValidationError } from '../../types/errors.js';
import type { Env } from '../../config/env.js';
import type { IPluginManifestValidator } from '../../infrastructure-platform/ports/iplugin-manifest-validator.port.js';
import type { IPluginRegistry, RegisterPluginInput } from '../../infrastructure-platform/ports/iplugin-registry.port.js';
import type {
  PluginManifest,
  PluginType,
  RegisteredPlugin,
} from '../../infrastructure-platform/types/plugin.types.js';
import {
  findCatalogPlugin,
  PROVIDER_PLUGIN_CATALOG,
} from '../../infrastructure-platform/catalog/provider-plugin-catalog.js';

interface PluginRow {
  id: string;
  plugin_type: string;
  manifest_json: string;
  status: string;
  registered_at: string;
  updated_at: string;
  enabled_at: string | null;
}

function mapRow(row: PluginRow): RegisteredPlugin {
  return {
    manifest: JSON.parse(row.manifest_json) as PluginManifest,
    status: row.status as RegisteredPlugin['status'],
    registeredAt: row.registered_at,
    updatedAt: row.updated_at,
    enabledAt: row.enabled_at ?? undefined,
  };
}

function envValueForKey(env: Env, key: string | undefined): string | undefined {
  if (!key) return undefined;
  return String((env as Record<string, unknown>)[key] ?? '');
}

/** SQL-backed plugin registry (Phase 20). */
export class SqlPluginRegistry implements IPluginRegistry {
  constructor(
    private readonly sql: ISqlDatabase,
    private readonly env: Env,
    private readonly validator: IPluginManifestValidator,
  ) {}

  async register(input: RegisterPluginInput): Promise<RegisteredPlugin> {
    if (!input.skipValidation) {
      const result = this.validator.validate(input.manifest);
      if (!result.valid) {
        throw new ValidationError(result.errors.join('; '));
      }
    }

    const existing = await this.get(input.manifest.id);
    const now = nowISO();
    if (existing) {
      await this.sql.execute(
        `UPDATE plugin_registry SET manifest_json = ?, plugin_type = ?, updated_at = ?
         WHERE id = ?`,
        [JSON.stringify(input.manifest), input.manifest.type, now, input.manifest.id],
      );
      return (await this.get(input.manifest.id))!;
    }

    await this.sql.execute(
      `INSERT INTO plugin_registry (id, plugin_type, manifest_json, status, registered_at, updated_at, enabled_at)
       VALUES (?, ?, ?, 'registered', ?, ?, NULL)`,
      [input.manifest.id, input.manifest.type, JSON.stringify(input.manifest), now, now],
    );

    return (await this.get(input.manifest.id))!;
  }

  async enable(pluginId: string): Promise<RegisteredPlugin> {
    const plugin = await this.get(pluginId);
    if (!plugin) throw new NotFoundError('Plugin', pluginId);

    const now = nowISO();
    await this.sql.execute(
      `UPDATE plugin_registry SET status = 'disabled', updated_at = ?
       WHERE plugin_type = ? AND id != ? AND status = 'enabled'`,
      [now, plugin.manifest.type, pluginId],
    );
    await this.sql.execute(
      `UPDATE plugin_registry SET status = 'enabled', enabled_at = ?, updated_at = ? WHERE id = ?`,
      [now, now, pluginId],
    );
    return (await this.get(pluginId))!;
  }

  async disable(pluginId: string): Promise<RegisteredPlugin> {
    const plugin = await this.get(pluginId);
    if (!plugin) throw new NotFoundError('Plugin', pluginId);
    const now = nowISO();
    await this.sql.execute(
      `UPDATE plugin_registry SET status = 'disabled', updated_at = ? WHERE id = ?`,
      [now, pluginId],
    );
    return (await this.get(pluginId))!;
  }

  async get(pluginId: string): Promise<RegisteredPlugin | null> {
    const rows = await this.sql.query<PluginRow>(
      `SELECT id, plugin_type, manifest_json, status, registered_at, updated_at, enabled_at
       FROM plugin_registry WHERE id = ?`,
      [pluginId],
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async list(): Promise<RegisteredPlugin[]> {
    const rows = await this.sql.query<PluginRow>(
      `SELECT id, plugin_type, manifest_json, status, registered_at, updated_at, enabled_at
       FROM plugin_registry ORDER BY plugin_type, id`,
    );
    return rows.map(mapRow);
  }

  async listByType(type: PluginType): Promise<RegisteredPlugin[]> {
    const rows = await this.sql.query<PluginRow>(
      `SELECT id, plugin_type, manifest_json, status, registered_at, updated_at, enabled_at
       FROM plugin_registry WHERE plugin_type = ? ORDER BY id`,
      [type],
    );
    return rows.map(mapRow);
  }

  async getActivePluginId(type: PluginType): Promise<string> {
    const enabled = (await this.listByType(type)).find((p) => p.status === 'enabled');
    if (enabled) return enabled.manifest.id;
    return this.resolveEnvPluginId(type);
  }

  async bootstrapFromEnv(): Promise<void> {
    for (const manifest of PROVIDER_PLUGIN_CATALOG) {
      await this.register({ manifest, skipValidation: true });
    }

    for (const type of ['storage', 'embedding', 'vector', 'graph', 'llm'] as PluginType[]) {
      const activeId = this.resolveEnvPluginId(type);
      const plugin = await this.get(activeId);
      if (plugin) {
        await this.enable(activeId);
      }
    }
  }

  private resolveEnvPluginId(type: PluginType): string {
    const match = PROVIDER_PLUGIN_CATALOG.find(
      (p) =>
        p.type === type &&
        p.envAdapterKey &&
        envValueForKey(this.env, p.envAdapterKey) === p.envAdapterValue,
    );
    if (match) return match.id;

    const fallback = PROVIDER_PLUGIN_CATALOG.find((p) => p.type === type);
    return fallback?.id ?? `unknown-${type}`;
  }
}

/** In-memory registry for unit tests. */
export class InMemoryPluginRegistry implements IPluginRegistry {
  private readonly plugins = new Map<string, RegisteredPlugin>();

  constructor(
    private readonly env: Env,
    private readonly validator: IPluginManifestValidator,
  ) {}

  async register(input: RegisterPluginInput): Promise<RegisteredPlugin> {
    if (!input.skipValidation) {
      const result = this.validator.validate(input.manifest);
      if (!result.valid) throw new ValidationError(result.errors.join('; '));
    }
    const now = new Date().toISOString();
    const record: RegisteredPlugin = {
      manifest: input.manifest,
      status: 'registered',
      registeredAt: now,
      updatedAt: now,
    };
    this.plugins.set(input.manifest.id, record);
    return record;
  }

  async enable(pluginId: string): Promise<RegisteredPlugin> {
    const plugin = await this.get(pluginId);
    if (!plugin) throw new NotFoundError('Plugin', pluginId);
    for (const [id, entry] of this.plugins) {
      if (entry.manifest.type === plugin.manifest.type && entry.status === 'enabled') {
        entry.status = 'disabled';
        entry.updatedAt = new Date().toISOString();
        this.plugins.set(id, entry);
      }
    }
    plugin.status = 'enabled';
    plugin.enabledAt = new Date().toISOString();
    plugin.updatedAt = plugin.enabledAt;
    this.plugins.set(pluginId, plugin);
    return plugin;
  }

  async disable(pluginId: string): Promise<RegisteredPlugin> {
    const plugin = await this.get(pluginId);
    if (!plugin) throw new NotFoundError('Plugin', pluginId);
    plugin.status = 'disabled';
    plugin.updatedAt = new Date().toISOString();
    this.plugins.set(pluginId, plugin);
    return plugin;
  }

  async get(pluginId: string): Promise<RegisteredPlugin | null> {
    return this.plugins.get(pluginId) ?? null;
  }

  async list(): Promise<RegisteredPlugin[]> {
    return [...this.plugins.values()];
  }

  async listByType(type: PluginType): Promise<RegisteredPlugin[]> {
    return [...this.plugins.values()].filter((p) => p.manifest.type === type);
  }

  async getActivePluginId(type: PluginType): Promise<string> {
    const enabled = (await this.listByType(type)).find((p) => p.status === 'enabled');
    if (enabled) return enabled.manifest.id;
    const match = PROVIDER_PLUGIN_CATALOG.find(
      (p) =>
        p.type === type &&
        p.envAdapterKey &&
        String((this.env as Record<string, unknown>)[p.envAdapterKey] ?? '') === p.envAdapterValue,
    );
    return match?.id ?? findCatalogPlugin(`unknown-${type}`)?.id ?? `unknown-${type}`;
  }

  async bootstrapFromEnv(): Promise<void> {
    for (const manifest of PROVIDER_PLUGIN_CATALOG) {
      await this.register({ manifest, skipValidation: true });
    }
    for (const type of ['storage', 'embedding', 'vector', 'graph', 'llm'] as PluginType[]) {
      const id = await this.getActivePluginId(type);
      if (await this.get(id)) await this.enable(id);
    }
  }
}
