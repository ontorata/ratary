export type {
  ConnectorId,
  ConnectorDescriptor,
  ExternalKnowledgeItem,
  ConnectorPullInput,
  ConnectorPullResult,
} from './types/connector.types.js';
export { CONNECTOR_IDS } from './types/connector.types.js';

export type {
  FabricIngestMode,
  FabricIngestStatus,
  FabricIngestStats,
  FabricIngestInput,
  FabricIngestRun,
  FabricConnectorState,
  KnowledgeFabricStatusResult,
  KnowledgeFabricPlatformManifest,
  NormalizedFabricMemory,
} from './types/ingest.types.js';

export type { IKnowledgeConnector } from './ports/iknowledge-connector.port.js';
export type { IFabricNormalizer } from './ports/ifabric-normalizer.port.js';
export type { IFabricPolicy } from './ports/ifabric-policy.port.js';
export type {
  IFabricExternalRefStore,
  FabricExternalRef,
} from './ports/ifabric-external-ref-store.port.js';
export type { IKnowledgeFabricIngestStore } from './ports/iknowledge-fabric-ingest-store.port.js';
export type { IKnowledgeFabricOrchestrator } from './ports/iknowledge-fabric-orchestrator.port.js';

export {
  createKnowledgeConnectors,
  createWebhookConnectors,
  EnvConfiguredKnowledgeConnector,
  NoOpKnowledgeConnector,
  WebhookPushConnector,
} from './adapters/knowledge-connector-registry.js';
export { NotionLiveConnector } from './adapters/notion-live-connector.js';
export { ConfluenceLiveConnector } from './adapters/confluence-live-connector.js';
export { DriveLiveConnector } from './adapters/drive-live-connector.js';
export { ConnectorSyncJobRunner } from './sync/connector-sync-job-runner.js';
export { verifyWebhookSignature, signWebhookPayload } from './sync/webhook-signature.js';
export { DefaultFabricNormalizer } from './adapters/default-fabric-normalizer.js';
export { RuleBasedFabricPolicy, DenyAllFabricPolicy } from './adapters/rule-based-fabric-policy.js';
export {
  KnowledgeFabricOrchestrator,
  NoOpKnowledgeFabricOrchestrator,
} from './services/knowledge-fabric-orchestrator.js';
export { KnowledgeFabricManifestBuilder } from './builders/knowledge-fabric-manifest-builder.js';
