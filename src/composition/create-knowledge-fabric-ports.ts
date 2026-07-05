import type { Env } from '../config/env.js';
import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import type { MemoryService } from '../services/memory.service.js';
import type { IMetricsExporter } from '../observability/ports/imetrics-exporter.port.js';
import type { ConnectorId } from '../knowledge-fabric-platform/types/connector.types.js';
import type { WebhookPushConnector } from '../knowledge-fabric-platform/adapters/knowledge-connector-registry.js';
import {
  createKnowledgeConnectors,
  createWebhookConnectors,
  DefaultFabricNormalizer,
  RuleBasedFabricPolicy,
  DenyAllFabricPolicy,
  KnowledgeFabricOrchestrator,
  NoOpKnowledgeFabricOrchestrator,
  KnowledgeFabricManifestBuilder,
} from '../knowledge-fabric-platform/index.js';
import { ConnectorSyncJobRunner } from '../knowledge-fabric-platform/sync/connector-sync-job-runner.js';
import {
  SqlKnowledgeFabricStore,
  NoOpKnowledgeFabricStore,
} from '../infrastructure/knowledge-fabric-platform/sql-knowledge-fabric-store.js';

export interface KnowledgeFabricPorts {
  enabled: boolean;
  connectorSyncEnabled: boolean;
  orchestrator: KnowledgeFabricOrchestrator | NoOpKnowledgeFabricOrchestrator;
  syncJobRunner: ConnectorSyncJobRunner | null;
  webhookConnectors: Map<ConnectorId, WebhookPushConnector>;
  manifestBuilder: KnowledgeFabricManifestBuilder;
  recordIngestLifecycle(
    metricsExporter: IMetricsExporter | undefined,
    connectorId: ConnectorId,
    status: 'completed' | 'failed',
  ): void;
}

/**
 * Composition root for Phase 23 enterprise knowledge fabric (ADR-047).
 * Phase 29 adds live sync + webhook push when CONNECTOR_SYNC_ENABLED.
 */
export function createKnowledgeFabricPorts(
  sql: ISqlDatabase,
  env: Env,
  memoryService: MemoryService,
): KnowledgeFabricPorts {
  const noopStore = new NoOpKnowledgeFabricStore();
  const noopConnectors = createKnowledgeConnectors(env);
  const noopWebhook = createWebhookConnectors();

  const noop: KnowledgeFabricPorts = {
    enabled: false,
    connectorSyncEnabled: false,
    orchestrator: new NoOpKnowledgeFabricOrchestrator(),
    syncJobRunner: null,
    webhookConnectors: noopWebhook,
    manifestBuilder: new KnowledgeFabricManifestBuilder(env, noopStore, noopConnectors),
    recordIngestLifecycle: () => undefined,
  };

  if (!env.KNOWLEDGE_FABRIC_ENABLED) {
    return noop;
  }

  const store = new SqlKnowledgeFabricStore(sql);
  const connectors = createKnowledgeConnectors(env);
  const webhookConnectors = createWebhookConnectors();
  const orchestrator = new KnowledgeFabricOrchestrator(
    connectors,
    new DefaultFabricNormalizer(),
    new RuleBasedFabricPolicy(),
    store,
    store,
    memoryService,
  );
  const manifestBuilder = new KnowledgeFabricManifestBuilder(env, store, connectors);
  const syncJobRunner = env.CONNECTOR_SYNC_ENABLED
    ? new ConnectorSyncJobRunner(orchestrator)
    : null;

  return {
    enabled: true,
    connectorSyncEnabled: env.CONNECTOR_SYNC_ENABLED,
    orchestrator,
    syncJobRunner,
    webhookConnectors,
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
