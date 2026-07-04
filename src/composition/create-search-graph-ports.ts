import type { Env } from '../config/env.js';
import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import type { IMetricsExporter } from '../observability/ports/imetrics-exporter.port.js';
import {
  MeilisearchIndexSyncer,
  Neo4jGraphIndexSyncer,
  NoOpSearchIndexSyncer,
  NoOpGraphIndexSyncer,
  SearchGraphOrchestrator,
  SearchGraphManifestBuilder,
} from '../search-graph-platform/index.js';
import {
  SqlSearchGraphSyncStore,
  NoOpSearchGraphSyncStore,
} from '../infrastructure/search-graph-platform/sql-search-graph-sync-store.js';

export interface SearchGraphPorts {
  enabled: boolean;
  orchestrator: SearchGraphOrchestrator;
  manifestBuilder: SearchGraphManifestBuilder;
  recordSyncLifecycle(
    metricsExporter: IMetricsExporter | undefined,
    target: 'meilisearch' | 'neo4j',
    status: 'completed' | 'failed',
  ): void;
}

/**
 * Composition root for Phase 21 search & graph production platform (ADR-022).
 * Gated by SEARCH_GRAPH_PLATFORM_ENABLED — default off preserves Phase 10 env adapters.
 */
export function createSearchGraphPorts(sql: ISqlDatabase, env: Env): SearchGraphPorts {
  const noopSearch = new NoOpSearchIndexSyncer();
  const noopGraph = new NoOpGraphIndexSyncer();
  const noopStore = new NoOpSearchGraphSyncStore();

  const noop: SearchGraphPorts = {
    enabled: false,
    orchestrator: new SearchGraphOrchestrator(noopSearch, noopGraph, noopStore),
    manifestBuilder: new SearchGraphManifestBuilder(env, noopStore, noopSearch, noopGraph),
    recordSyncLifecycle: () => undefined,
  };

  if (!env.SEARCH_GRAPH_PLATFORM_ENABLED) {
    return noop;
  }

  const store = new SqlSearchGraphSyncStore(sql);
  const searchSyncer = new MeilisearchIndexSyncer(sql, env);
  const graphSyncer = new Neo4jGraphIndexSyncer(sql, env);
  const orchestrator = new SearchGraphOrchestrator(searchSyncer, graphSyncer, store);
  const manifestBuilder = new SearchGraphManifestBuilder(env, store, searchSyncer, graphSyncer);

  return {
    enabled: true,
    orchestrator,
    manifestBuilder,
    recordSyncLifecycle(metricsExporter, target, status) {
      if (!metricsExporter) return;
      metricsExporter.incrementCounter({
        name: 'ai_brain_search_graph_sync_total',
        labels: { target, status },
      });
    },
  };
}
