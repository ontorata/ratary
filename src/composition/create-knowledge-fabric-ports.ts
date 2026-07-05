import type { Env } from '../config/env.js';
import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import type { MemoryService } from '../services/memory.service.js';
import type { IMetricsExporter } from '../observability/ports/imetrics-exporter.port.js';
import type { ConnectorId } from '../knowledge-fabric-platform/types/connector.types.js';
import {
  createKnowledgeConnectors,
  DefaultFabricNormalizer,
  RuleBasedFabricPolicy,
  DenyAllFabricPolicy,
  KnowledgeFabricOrchestrator,
  NoOpKnowledgeFabricOrchestrator,
  KnowledgeFabricManifestBuilder,
} from '../knowledge-fabric-platform/index.js';
import {
  SqlKnowledgeFabricStore,
  NoOpKnowledgeFabricStore,
} from '../infrastructure/knowledge-fabric-platform/sql-knowledge-fabric-store.js';

export interface KnowledgeFabricPorts {
  enabled: boolean;
  orchestrator: KnowledgeFabricOrchestrator | NoOpKnowledgeFabricOrchestrator;
  manifestBuilder: KnowledgeFabricManifestBuilder;
  recordIngestLifecycle(
    metricsExporter: IMetricsExporter | undefined,
    connectorId: ConnectorId,
    status: 'completed' | 'failed',
  ): void;
}

/**
 * Composition root for Phase 23 enterprise knowledge fabric (ADR-047).
 * Gated by KNOWLEDGE_FABRIC_ENABLED — default off preserves MemoryService-only writes.
 */
export function createKnowledgeFabricPorts(
  sql: ISqlDatabase,
  env: Env,
  memoryService: MemoryService,
): KnowledgeFabricPorts {
  const noopStore = new NoOpKnowledgeFabricStore();
  const noopConnectors = createKnowledgeConnectors(env);

  const noop: KnowledgeFabricPorts = {
    enabled: false,
    orchestrator: new NoOpKnowledgeFabricOrchestrator(),
    manifestBuilder: new KnowledgeFabricManifestBuilder(env, noopStore, noopConnectors),
    recordIngestLifecycle: () => undefined,
  };

  if (!env.KNOWLEDGE_FABRIC_ENABLED) {
    return noop;
  }

  const store = new SqlKnowledgeFabricStore(sql);
  const connectors = createKnowledgeConnectors(env);
  const orchestrator = new KnowledgeFabricOrchestrator(
    connectors,
    new DefaultFabricNormalizer(),
    new RuleBasedFabricPolicy(),
    store,
    store,
    memoryService,
  );
  const manifestBuilder = new KnowledgeFabricManifestBuilder(env, store, connectors);

  return {
    enabled: true,
    orchestrator,
    manifestBuilder,
    recordIngestLifecycle(metricsExporter, connectorId, status) {
      if (!metricsExporter) return;
      metricsExporter.incrementCounter({
        name: 'ratary_knowledge_fabric_ingest_total',
        labels: { connector: connectorId, status },
      });
    },
  };
}

/** Exposed for unit tests — deny-all policy variant. */
export function createDenyAllFabricPolicy(): DenyAllFabricPolicy {
  return new DenyAllFabricPolicy();
}
