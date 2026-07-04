import type { Env } from '../config/env.js';
import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import type { IMetricsExporter } from '../observability/ports/imetrics-exporter.port.js';
import {
  LocalProviderMarketplace,
  NoOpProviderMarketplace,
} from '../infrastructure-platform/adapters/local-provider-marketplace.js';
import {
  SchemaPluginManifestValidator,
  NoOpPluginManifestValidator,
} from '../infrastructure-platform/adapters/schema-plugin-manifest-validator.js';
import { NoOpPluginAllowList } from '../infrastructure-platform/adapters/noop-plugin-allow-list.js';
import { SqlPluginRegistry } from '../infrastructure/infrastructure-platform/sql-plugin-registry.js';
import { SqlPluginAllowList } from '../infrastructure/infrastructure-platform/sql-plugin-allow-list.js';
import type { PluginType } from '../infrastructure-platform/types/plugin.types.js';
import type { IPluginRegistry, RegisterPluginInput } from '../infrastructure-platform/ports/iplugin-registry.port.js';
import type { RegisteredPlugin } from '../infrastructure-platform/types/plugin.types.js';
import type { IProviderMarketplace } from '../infrastructure-platform/ports/iprovider-marketplace.port.js';
import type { IPluginManifestValidator } from '../infrastructure-platform/ports/iplugin-manifest-validator.port.js';
import type { IPluginAllowList } from '../infrastructure-platform/ports/iplugin-allow-list.port.js';
import { InfrastructureManifestBuilder } from '../infrastructure-platform/builders/infrastructure-manifest-builder.js';

export interface InfrastructurePlatformPorts {
  enabled: boolean;
  pluginRegistry: IPluginRegistry;
  marketplace: IProviderMarketplace;
  manifestValidator: IPluginManifestValidator;
  allowList: IPluginAllowList;
  manifestBuilder: InfrastructureManifestBuilder;
  recordPluginLifecycle(
    metricsExporter: IMetricsExporter | undefined,
    action: 'register' | 'enable' | 'disable',
    pluginId: string,
  ): void;
}

class NoOpPluginRegistry implements IPluginRegistry {
  async register(_input: RegisterPluginInput): Promise<RegisteredPlugin> {
    throw new Error('Plugin marketplace disabled');
  }
  async enable(_pluginId: string): Promise<RegisteredPlugin> {
    throw new Error('Plugin marketplace disabled');
  }
  async disable(_pluginId: string): Promise<RegisteredPlugin> {
    throw new Error('Plugin marketplace disabled');
  }
  async get(_pluginId: string): Promise<RegisteredPlugin | null> {
    return null;
  }
  async list(): Promise<RegisteredPlugin[]> {
    return [];
  }
  async listByType(_type: PluginType): Promise<RegisteredPlugin[]> {
    return [];
  }
  async getActivePluginId(type: PluginType): Promise<string> {
    return `env-${type}`;
  }
  async bootstrapFromEnv(): Promise<void> {
    // intentionally empty
  }
}

/**
 * Composition root for Phase 20 AI infrastructure platform (ADR-035).
 * Gated by PLUGIN_MARKETPLACE_ENABLED — default off preserves Phase 10 env adapters.
 */
export async function createInfrastructurePlatformPorts(
  sql: ISqlDatabase,
  env: Env,
): Promise<InfrastructurePlatformPorts> {
  const noop: InfrastructurePlatformPorts = {
    enabled: false,
    pluginRegistry: new NoOpPluginRegistry(),
    marketplace: new NoOpProviderMarketplace(),
    manifestValidator: new NoOpPluginManifestValidator(),
    allowList: new NoOpPluginAllowList(),
    manifestBuilder: new InfrastructureManifestBuilder(env, new NoOpPluginRegistry(), new NoOpProviderMarketplace()),
    recordPluginLifecycle: () => undefined,
  };

  if (!env.PLUGIN_MARKETPLACE_ENABLED) {
    return noop;
  }

  const validator = new SchemaPluginManifestValidator({
    requireSignature: env.PLUGIN_SIGNATURE_REQUIRED,
  });
  const pluginRegistry = new SqlPluginRegistry(sql, env, validator);
  await pluginRegistry.bootstrapFromEnv();

  const marketplace = new LocalProviderMarketplace();
  const allowList = env.CONTROL_PLANE_ENABLED
    ? new SqlPluginAllowList(sql)
    : new NoOpPluginAllowList();

  const manifestBuilder = new InfrastructureManifestBuilder(env, pluginRegistry, marketplace);

  return {
    enabled: true,
    pluginRegistry,
    marketplace,
    manifestValidator: validator,
    allowList,
    manifestBuilder,
    recordPluginLifecycle(metricsExporter, action, pluginId) {
      if (!metricsExporter) return;
      metricsExporter.incrementCounter({
        name: 'ai_brain_plugin_lifecycle_total',
        labels: { action, plugin_id: pluginId },
      });
    },
  };
}
