import type {
  ConnectorId,
  ConnectorPullInput,
  ConnectorPullResult,
} from '../types/connector.types.js';

/** External enterprise knowledge source (Phase 23). */
export interface IKnowledgeConnector {
  readonly connectorId: ConnectorId;
  isConfigured(): boolean;
  pull(input: ConnectorPullInput): Promise<ConnectorPullResult>;
}
