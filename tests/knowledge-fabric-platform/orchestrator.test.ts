import { describe, it, expect } from 'vitest';
import { InMemoryKnowledgeFabricStore } from '../../src/infrastructure/knowledge-fabric-platform/sql-knowledge-fabric-store.js';
import { KnowledgeFabricOrchestrator } from '../../src/knowledge-fabric-platform/services/knowledge-fabric-orchestrator.js';
import { DefaultFabricNormalizer } from '../../src/knowledge-fabric-platform/adapters/default-fabric-normalizer.js';
import { RuleBasedFabricPolicy } from '../../src/knowledge-fabric-platform/adapters/rule-based-fabric-policy.js';
import type { IKnowledgeConnector } from '../../src/knowledge-fabric-platform/ports/iknowledge-connector.port.js';
import type { ConnectorId, ConnectorPullInput, ConnectorPullResult } from '../../src/knowledge-fabric-platform/types/connector.types.js';
import { createMemoryService } from '../../src/services/create-memory-service.js';
import { MemoryRepository } from '../../src/repositories/memory.repository.js';
import { MockD1Client } from '../helpers/mock-d1.js';

class FakeNotionConnector implements IKnowledgeConnector {
  readonly connectorId: ConnectorId = 'notion';

  isConfigured(): boolean {
    return true;
  }

  async pull(_input: ConnectorPullInput): Promise<ConnectorPullResult> {
    return {
      items: [
        {
          externalId: 'page-1',
          title: 'Fabric doc',
          body: 'External knowledge body',
          updatedAt: '2026-07-04T12:00:00.000Z',
          metadata: { project: 'ops' },
        },
      ],
      nextCursor: '2026-07-04T12:00:00.000Z',
      stats: { fetched: 1, skipped: 0 },
    };
  }
}

describe('KnowledgeFabricOrchestrator', () => {
  it('records completed dry-run ingest', async () => {
    const sql = new MockD1Client();
    const memoryService = createMemoryService(sql, new MemoryRepository(sql));
    const store = new InMemoryKnowledgeFabricStore();
    const connectors = new Map<ConnectorId, IKnowledgeConnector>([['notion', new FakeNotionConnector()]]);
    const orchestrator = new KnowledgeFabricOrchestrator(
      connectors,
      new DefaultFabricNormalizer(),
      new RuleBasedFabricPolicy(),
      store,
      store,
      memoryService,
    );

    const run = await orchestrator.ingest(
      { connectorId: 'notion', mode: 'full', dryRun: true },
      { ownerId: 'owner-1' },
    );

    expect(run.status).toBe('completed');
    expect(run.stats.fetched).toBe(1);
    expect(run.stats.created).toBe(1);
  });
});
