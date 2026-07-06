import type { MemoryService } from '../../services/memory.service.js';
import type { IKnowledgeExchangeService } from '../../federation/ports/iknowledge-exchange.port.js';
import type { IFabricExternalRefStore } from '../ports/ifabric-external-ref-store.port.js';
import type { IFabricProvenanceStore } from '../ports/ifabric-provenance-store.port.js';
import type { IKnowledgeFabricOrchestrator } from '../ports/iknowledge-fabric-orchestrator.port.js';
import type { IUniversalFabricOrchestrator } from '../ports/iuniversal-fabric-orchestrator.port.js';
import type { UniversalFabricPolicy } from '../adapters/universal-fabric-policy.js';
import type { ConnectorDescriptor, ConnectorId } from '../types/connector.types.js';
import type { IKnowledgeConnector } from '../ports/iknowledge-connector.port.js';
import type {
  FabricIngestInput,
  FabricIngestRun,
  FabricConnectorState,
  KnowledgeFabricStatusResult,
} from '../types/ingest.types.js';
import type {
  FabricPeerPullInput,
  FabricPeerPullResult,
  FabricProvenanceRecord,
} from '../types/fabric-provenance.types.js';
import type { MemoryScope } from '../../types/memory-scope.js';
import { ForbiddenError } from '../../types/errors.js';
import { nowISO } from '../../utils/memory-mapper.js';

/**
 * Unifies connector fabric ingest with federation peer pull (Phase 32).
 * Delegates connector path to inner orchestrator; records unified provenance.
 */
export class UniversalMemoryFabricOrchestrator implements IUniversalFabricOrchestrator {
  constructor(
    private readonly inner: IKnowledgeFabricOrchestrator,
    private readonly exchange: IKnowledgeExchangeService,
    private readonly policy: UniversalFabricPolicy,
    private readonly provenanceStore: IFabricProvenanceStore,
    private readonly refStore: IFabricExternalRefStore,
    private readonly memoryService: MemoryService,
    private readonly nodeId: string,
  ) {}

  ingest(
    input: FabricIngestInput,
    scope: MemoryScope,
    connectorOverride?: IKnowledgeConnector,
  ): Promise<FabricIngestRun> {
    return this.ingestWithProvenance(input, scope, connectorOverride);
  }

  private async ingestWithProvenance(
    input: FabricIngestInput,
    scope: MemoryScope,
    connectorOverride?: IKnowledgeConnector,
  ): Promise<FabricIngestRun> {
    const run = await this.inner.ingest(input, scope, connectorOverride);
    if (run.status !== 'completed' || run.stats.dryRun) {
      return run;
    }

    const state = await this.refStore.getConnectorState(input.connectorId, scope);
    if (!state?.lastCursor) {
      return run;
    }

    const ts = nowISO();
    const created = run.stats.created;
    const updated = run.stats.updated;
    if (created + updated === 0) {
      return run;
    }

    await this.recordConnectorProvenanceFromTags(input.connectorId, scope, ts);
    return run;
  }

  private async recordConnectorProvenanceFromTags(
    connectorId: ConnectorId,
    scope: MemoryScope,
    ts: string,
  ): Promise<void> {
    const { memories } = await this.memoryService.listMemories(scope, { limit: 100, offset: 0 });
    for (const memory of memories) {
      const refTag = memory.tags.find((t) => t.startsWith('fabric-ref:'));
      if (!refTag || !memory.tags.includes(`fabric:${connectorId}`)) continue;

      const externalId = refTag.slice('fabric-ref:'.length);
      await this.provenanceStore.upsert({
        sourceKind: 'connector',
        sourceId: connectorId,
        externalId,
        memoryId: memory.id,
        ownerId: scope.ownerId,
        workspaceId: scope.workspaceId,
        externalUpdatedAt: memory.updatedAt,
        metadata: { universal: true },
        updatedAt: ts,
      });
    }
  }

  async pullFromPeer(
    input: FabricPeerPullInput,
    scope: MemoryScope,
  ): Promise<FabricPeerPullResult> {
    if (!(await this.policy.canPullPeer(input.peerId, scope))) {
      throw new ForbiddenError('Universal fabric peer pull denied by policy');
    }

    if (input.dryRun) {
      return {
        peerId: input.peerId,
        accepted: 0,
        rejected: 0,
        dryRun: true,
        timestamp: nowISO(),
      };
    }

    const result = await this.exchange.pullAndApply(
      input.peerId,
      {
        source: { nodeId: input.peerId, ownerId: scope.ownerId, workspaceId: scope.workspaceId },
        target: { nodeId: this.nodeId, ownerId: scope.ownerId, workspaceId: scope.workspaceId },
        cursor: input.cursor ?? null,
        limit: input.limit,
      },
      scope,
    );

    const ts = nowISO();
    if (result.bundleId && result.accepted > 0) {
      await this.provenanceStore.upsert({
        sourceKind: 'federation_peer',
        sourceId: input.peerId,
        externalId: result.bundleId,
        memoryId: `bundle:${result.bundleId}`,
        ownerId: scope.ownerId,
        workspaceId: scope.workspaceId,
        externalUpdatedAt: ts,
        metadata: { accepted: result.accepted, rejected: result.rejected },
        updatedAt: ts,
      });
    }

    return {
      peerId: input.peerId,
      accepted: result.accepted,
      rejected: result.rejected,
      bundleId: result.bundleId,
      cursor: result.cursor,
      dryRun: false,
      timestamp: result.timestamp,
    };
  }

  listProvenance(scope: MemoryScope, limit?: number): Promise<FabricProvenanceRecord[]> {
    return this.provenanceStore.listByScope(scope, limit);
  }

  listRuns(limit?: number): Promise<FabricIngestRun[]> {
    return this.inner.listRuns(limit);
  }

  listConnectors(): ConnectorDescriptor[] {
    return this.inner.listConnectors();
  }

  getConnectorState(
    connectorId: ConnectorId,
    scope: MemoryScope,
  ): Promise<FabricConnectorState | null> {
    return this.inner.getConnectorState(connectorId, scope);
  }

  async getStatus(): Promise<KnowledgeFabricStatusResult> {
    const base = await this.inner.getStatus();
    return { ...base, universalEnabled: true } as KnowledgeFabricStatusResult & {
      universalEnabled: boolean;
    };
  }
}
