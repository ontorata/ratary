import type { Env } from '../config/env.js';
import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import type { MemoryService } from '../services/memory.service.js';
import type { IMetricsExporter } from '../observability/ports/imetrics-exporter.port.js';
import type { ConnectorId } from '../knowledge-fabric-platform/types/connector.types.js';
import type { WebhookPushConnector } from '../knowledge-fabric-platform/adapters/knowledge-connector-registry.js';
import type { IKnowledgeExchangeService } from '../federation/ports/iknowledge-exchange.port.js';
import type { IUniversalFabricOrchestrator } from '../knowledge-fabric-platform/ports/iuniversal-fabric-orchestrator.port.js';
import {
  createKnowledgeConnectors,
  createWebhookConnectors,
  DefaultFabricNormalizer,
  RuleBasedFabricPolicy,
  DenyAllFabricPolicy,
  KnowledgeFabricOrchestrator,
  NoOpKnowledgeFabricOrchestrator,
  KnowledgeFabricManifestBuilder,
  UniversalMemoryFabricOrchestrator,
  UniversalFabricPolicy,
} from '../knowledge-fabric-platform/index.js';
import { ConnectorSyncJobRunner } from '../knowledge-fabric-platform/sync/connector-sync-job-runner.js';
import {
  SqlKnowledgeFabricStore,
  NoOpKnowledgeFabricStore,
} from '../infrastructure/knowledge-fabric-platform/sql-knowledge-fabric-store.js';
import {
  SqlFabricProvenanceStore,
  NoOpFabricProvenanceStore,
} from '../infrastructure/knowledge-fabric-platform/sql-fabric-provenance-store.js';

export interface KnowledgeFabricPorts {
  enabled: boolean;
  universalEnabled: boolean;
  connectorSyncEnabled: boolean;
  orchestrator:
    KnowledgeFabricOrchestrator | NoOpKnowledgeFabricOrchestrator | IUniversalFabricOrchestrator;
  syncJobRunner: ConnectorSyncJobRunner | null;
  webhookConnectors: Map<ConnectorId, WebhookPushConnector>;
  manifestBuilder: KnowledgeFabricManifestBuilder;
  recordIngestLifecycle(
    metricsExporter: IMetricsExporter | undefined,
    connectorId: ConnectorId,
    status: 'completed' | 'failed',
  ): void;
}

export interface CreateKnowledgeFabricPortsOptions {
  federationExchange?: IKnowledgeExchangeService | null;
  federationNodeId?: string;
}

/**
 * Composition root for Phase 23 enterprise knowledge fabric (ADR-047).
 * Phase 29 adds live sync + webhook push when CONNECTOR_SYNC_ENABLED.
 * Phase 32 wraps universal orchestrator when UNIVERSAL_MEMORY_FABRIC_ENABLED.
 */
export function createKnowledgeFabricPorts(
  sql: ISqlDatabase,
  env: Env,
  memoryService: MemoryService,
  options: CreateKnowledgeFabricPortsOptions = {},
): KnowledgeFabricPorts {
  const noopStore = new NoOpKnowledgeFabricStore();
  const noopConnectors = createKnowledgeConnectors(env);
  const noopWebhook = createWebhookConnectors();

  const noop: KnowledgeFabricPorts = {
    enabled: false,
    universalEnabled: false,
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
  const basePolicy = new RuleBasedFabricPolicy();
  const baseOrchestrator = new KnowledgeFabricOrchestrator(
    connectors,
    new DefaultFabricNormalizer(),
    basePolicy,
    store,
    store,
    memoryService,
  );

  const universalOn =
    env.UNIVERSAL_MEMORY_FABRIC_ENABLED &&
    env.FEDERATION_ENABLED &&
    options.federationExchange != null;

  const provenanceStore = universalOn
    ? new SqlFabricProvenanceStore(sql)
    : new NoOpFabricProvenanceStore();

  const orchestrator = universalOn
    ? new UniversalMemoryFabricOrchestrator(
        baseOrchestrator,
        options.federationExchange!,
        new UniversalFabricPolicy(basePolicy, options.federationExchange!),
        provenanceStore,
        store,
        memoryService,
        options.federationNodeId ?? env.FEDERATION_NODE_ID,
      )
    : baseOrchestrator;

  const manifestBuilder = new KnowledgeFabricManifestBuilder(env, store, connectors);
  const syncJobRunner = env.CONNECTOR_SYNC_ENABLED
    ? new ConnectorSyncJobRunner(orchestrator)
    : null;

  return {
    enabled: true,
    universalEnabled: universalOn,
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
