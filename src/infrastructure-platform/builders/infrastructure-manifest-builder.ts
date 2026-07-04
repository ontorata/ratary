import type { Env } from '../../config/env.js';
import type { IPluginRegistry } from '../ports/iplugin-registry.port.js';
import type { IProviderMarketplace } from '../ports/iprovider-marketplace.port.js';
import type { InfrastructurePlatformManifest } from '../types/marketplace.types.js';
import { PLUGIN_TYPES } from '../catalog/provider-plugin-catalog.js';

export class InfrastructureManifestBuilder {
  constructor(
    private readonly env: Env,
    private readonly registry: IPluginRegistry,
    private readonly marketplace: IProviderMarketplace,
  ) {}

  async build(): Promise<InfrastructurePlatformManifest> {
    const catalog = await this.marketplace.getCatalog();
    const plugins: InfrastructurePlatformManifest['plugins'] = {};

    for (const type of PLUGIN_TYPES) {
      const active = await this.registry.getActivePluginId(type);
      const registered = await this.registry.listByType(type);
      const envFallback = this.envFallbackForType(type);
      plugins[type] = {
        active,
        available: registered.map((p) => p.manifest.id),
        envFallback,
      };
    }

    const protocols = ['rest', 'mcp'];
    if (this.env.GRPC_ENABLED) protocols.push('grpc');
    if (this.env.WEBSOCKET_ENABLED) protocols.push('websocket');
    if (this.env.SSE_ENABLED) protocols.push('sse');

    return {
      platform: 'ai-memory-infrastructure',
      protocols,
      plugins,
      marketplace: {
        catalogVersion: catalog.catalogVersion,
        source: catalog.source,
        entryCount: catalog.entries.length,
      },
      ...(this.env.FEDERATION_ENABLED
        ? {
            federation: {
              catalogSync: this.env.PLUGIN_FEDERATION_CATALOG_SYNC,
              catalogVersion: catalog.catalogVersion,
            },
          }
        : {}),
    };
  }

  private envFallbackForType(type: string): string {
    switch (type) {
      case 'storage':
        return this.env.SQL_PROVIDER;
      case 'embedding':
        return this.env.EMBEDDING_PROVIDER;
      case 'vector':
        return this.env.VECTOR_PROVIDER;
      case 'graph':
        return this.env.GRAPH_PROVIDER;
      case 'llm':
        return this.env.EMBEDDING_PROVIDER;
      default:
        return 'unknown';
    }
  }
}
