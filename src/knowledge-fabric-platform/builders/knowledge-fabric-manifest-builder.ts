import type { Env } from '../../config/env.js';
import type { IKnowledgeFabricIngestStore } from '../ports/iknowledge-fabric-ingest-store.port.js';
import type { IKnowledgeConnector } from '../ports/iknowledge-connector.port.js';
import type { KnowledgeFabricPlatformManifest } from '../types/ingest.types.js';
import { CONNECTOR_IDS } from '../types/connector.types.js';

export class KnowledgeFabricManifestBuilder {
  constructor(
    private readonly env: Env,
    private readonly ingestStore: IKnowledgeFabricIngestStore,
    private readonly connectors: Map<string, IKnowledgeConnector>,
  ) {}

  async build(): Promise<KnowledgeFabricPlatformManifest> {
    const latestRuns = await Promise.all(
      CONNECTOR_IDS.map(async (id) => ({
        id,
        run: await this.ingestStore.getLatestRun(id),
      })),
    );

    const lastRuns: KnowledgeFabricPlatformManifest['lastRuns'] = {};
    for (const { id, run } of latestRuns) {
      if (run) {
        lastRuns[id] = {
          id: run.id,
          connectorId: run.connectorId,
          status: run.status,
          finishedAt: run.finishedAt,
        };
      }
    }

    return {
      platform: 'enterprise-knowledge-fabric',
      enabled: this.env.KNOWLEDGE_FABRIC_ENABLED,
      connectors: CONNECTOR_IDS.map((id) => ({
        id,
        configured: this.connectors.get(id)?.isConfigured() ?? false,
      })),
      supportsIncrementalIngest: true,
      lastRuns,
    };
  }
}
