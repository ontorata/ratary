import type { MarketplaceCatalog, MarketplaceEntry } from '../types/marketplace.types.js';

/** Curated provider catalog metadata — no payments in v1 (ADR-035). */
export interface IProviderMarketplace {
  getCatalog(): Promise<MarketplaceCatalog>;
  getEntry(pluginId: string): Promise<MarketplaceEntry | null>;
  search(query: string): Promise<MarketplaceEntry[]>;
}
