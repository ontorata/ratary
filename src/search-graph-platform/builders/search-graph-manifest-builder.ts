import type { Env } from '../../config/env.js';
import type { ISearchGraphSyncStore } from '../ports/isearch-graph-sync-store.port.js';
import type { ISearchIndexSyncer } from '../ports/isearch-index-syncer.port.js';
import type { IGraphIndexSyncer } from '../ports/igraph-index-syncer.port.js';
import type { SearchGraphPlatformManifest } from '../types/sync.types.js';

export class SearchGraphManifestBuilder {
  constructor(
    private readonly env: Env,
    private readonly store: ISearchGraphSyncStore,
    private readonly searchSyncer: ISearchIndexSyncer,
    private readonly graphSyncer: IGraphIndexSyncer,
  ) {}

  async build(): Promise<SearchGraphPlatformManifest> {
    const [meilisearchRun, neo4jRun] = await Promise.all([
      this.store.getLatestRun('meilisearch'),
      this.store.getLatestRun('neo4j'),
    ]);

    return {
      platform: 'search-graph-production',
      searchProvider: this.env.SEARCH_PROVIDER,
      graphProvider: this.env.GRAPH_PROVIDER,
      meilisearchConfigured: this.searchSyncer.isConfigured(),
      neo4jConfigured: this.graphSyncer.isConfigured(),
      graphVectorSeedsEnabled: this.env.GRAPH_VECTOR_SEEDS_ENABLED,
      supportsIncrementalSync: true,
      lastRuns: {
        ...(meilisearchRun
          ? {
              meilisearch: {
                id: meilisearchRun.id,
                status: meilisearchRun.status,
                finishedAt: meilisearchRun.finishedAt,
              },
            }
          : {}),
        ...(neo4jRun
          ? {
              neo4j: {
                id: neo4jRun.id,
                status: neo4jRun.status,
                finishedAt: neo4jRun.finishedAt,
              },
            }
          : {}),
      },
    };
  }
}
