import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { IProviderMarketplace } from '../ports/iprovider-marketplace.port.js';
import type { MarketplaceCatalog, MarketplaceEntry } from '../types/marketplace.types.js';
import { PROVIDER_PLUGIN_CATALOG } from '../catalog/provider-plugin-catalog.js';

export interface LocalProviderMarketplaceOptions {
  catalogPath?: string;
}

function catalogFromCode(): MarketplaceCatalog {
  return {
    catalogVersion: '1.0.0',
    source: 'local',
    entries: PROVIDER_PLUGIN_CATALOG.map((p) => ({
      id: p.id,
      type: p.type,
      displayName: p.displayName,
      description: p.description ?? '',
      version: p.version,
      vendor: 'ontorata',
      implements: p.implements,
      curated: true,
      tags: [p.type],
    })),
  };
}

/** Local JSON marketplace catalog (ADR-035). */
export class LocalProviderMarketplace implements IProviderMarketplace {
  private readonly catalogPath: string;

  constructor(options: LocalProviderMarketplaceOptions = {}) {
    this.catalogPath =
      options.catalogPath ?? join(process.cwd(), 'infrastructure', 'marketplace', 'catalog.json');
  }

  async getCatalog(): Promise<MarketplaceCatalog> {
    if (!existsSync(this.catalogPath)) {
      return catalogFromCode();
    }
    try {
      const raw = readFileSync(this.catalogPath, 'utf8');
      return JSON.parse(raw) as MarketplaceCatalog;
    } catch {
      return catalogFromCode();
    }
  }

  async getEntry(pluginId: string): Promise<MarketplaceEntry | null> {
    const catalog = await this.getCatalog();
    return catalog.entries.find((e) => e.id === pluginId) ?? null;
  }

  async search(query: string): Promise<MarketplaceEntry[]> {
    const q = query.trim().toLowerCase();
    if (!q) return (await this.getCatalog()).entries;
    const catalog = await this.getCatalog();
    return catalog.entries.filter(
      (e) =>
        e.id.toLowerCase().includes(q) ||
        e.displayName.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.tags?.some((t) => t.toLowerCase().includes(q)),
    );
  }
}

export class NoOpProviderMarketplace implements IProviderMarketplace {
  async getCatalog(): Promise<MarketplaceCatalog> {
    return { catalogVersion: '0', source: 'local', entries: [] };
  }

  async getEntry(_pluginId: string): Promise<MarketplaceEntry | null> {
    return null;
  }

  async search(_query: string): Promise<MarketplaceEntry[]> {
    return [];
  }
}
