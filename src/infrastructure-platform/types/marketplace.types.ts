export interface MarketplaceEntry {
  id: string;
  type: string;
  displayName: string;
  description: string;
  version: string;
  vendor: string;
  implements: string;
  curated: boolean;
  tags?: string[];
}

export interface MarketplaceCatalog {
  catalogVersion: string;
  source: 'local' | 'remote';
  entries: MarketplaceEntry[];
}

export interface InfrastructurePlatformManifest {
  platform: 'ai-memory-infrastructure';
  protocols: string[];
  plugins: Record<
    string,
    {
      active: string;
      available: string[];
      envFallback: string;
    }
  >;
  marketplace: {
    catalogVersion: string;
    source: 'local' | 'remote';
    entryCount: number;
  };
  federation?: {
    catalogSync: boolean;
    catalogVersion?: string;
  };
}
