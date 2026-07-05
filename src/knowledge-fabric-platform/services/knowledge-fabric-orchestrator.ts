import type { MemoryService } from '../../services/memory.service.js';
import type { IKnowledgeConnector } from '../ports/iknowledge-connector.port.js';
import type { IFabricNormalizer } from '../ports/ifabric-normalizer.port.js';
import type { IFabricPolicy } from '../ports/ifabric-policy.port.js';
import type { IFabricExternalRefStore } from '../ports/ifabric-external-ref-store.port.js';
import type { IKnowledgeFabricIngestStore } from '../ports/iknowledge-fabric-ingest-store.port.js';
import type { IKnowledgeFabricOrchestrator } from '../ports/iknowledge-fabric-orchestrator.port.js';
import type { ConnectorDescriptor, ConnectorId } from '../types/connector.types.js';
import type {
  FabricIngestInput,
  FabricIngestRun,
  FabricIngestStats,
  KnowledgeFabricStatusResult,
} from '../types/ingest.types.js';
import type { MemoryScope } from '../../types/memory-scope.js';
import { ForbiddenError } from '../../types/errors.js';
import { nowISO } from '../../utils/memory-mapper.js';
import { newFabricIngestRunId } from '../../infrastructure/knowledge-fabric-platform/sql-knowledge-fabric-store.js';
import { CONNECTOR_IDS } from '../types/connector.types.js';

const CONNECTOR_LABELS: Record<ConnectorId, string> = {
  slack: 'Slack',
  github: 'GitHub',
  gitlab: 'GitLab',
  jira: 'Jira',
  confluence: 'Confluence',
  drive: 'Google Drive',
  sharepoint: 'SharePoint',
  email: 'Email',
  teams: 'Microsoft Teams',
  notion: 'Notion',
};

/** Orchestrates external knowledge ingest into MemoryService SSOT (Phase 23). */
export class KnowledgeFabricOrchestrator implements IKnowledgeFabricOrchestrator {
  constructor(
    private readonly connectors: Map<ConnectorId, IKnowledgeConnector>,
    private readonly normalizer: IFabricNormalizer,
    private readonly policy: IFabricPolicy,
    private readonly refStore: IFabricExternalRefStore,
    private readonly ingestStore: IKnowledgeFabricIngestStore,
    private readonly memoryService: MemoryService,
  ) {}

  async ingest(
    input: FabricIngestInput,
    scope: MemoryScope,
    connectorOverride?: IKnowledgeConnector,
  ): Promise<FabricIngestRun> {
    const connector = connectorOverride ?? this.connectors.get(input.connectorId);
    if (!connector?.isConfigured()) {
      throw new Error(`${input.connectorId} connector is not configured — check env credentials`);
    }

    if (!(await this.policy.canIngest(input.connectorId, scope))) {
      throw new ForbiddenError('Knowledge fabric ingest denied by policy');
    }

    const runId = newFabricIngestRunId();
    const startedAt = nowISO();
    const emptyStats: FabricIngestStats = {
      fetched: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
      dryRun: input.dryRun ?? false,
    };

    await this.ingestStore.startRun({
      id: runId,
      connectorId: input.connectorId,
      mode: input.mode,
      status: 'running',
      ownerId: scope.ownerId,
      workspaceId: scope.workspaceId,
      stats: emptyStats,
      startedAt,
    });

    const sinceCursor =
      input.mode === 'incremental'
        ? ((await this.refStore.getCursor(input.connectorId, scope)) ?? undefined)
        : undefined;

    try {
      const pullResult = await connector.pull({
        mode: input.mode,
        sinceCursor,
        limit: input.limit,
        dryRun: input.dryRun,
      });

      const items = await this.policy.filterIngestable(pullResult.items, input.connectorId, scope);

      const stats: FabricIngestStats = { ...emptyStats, fetched: items.length };

      for (const item of items) {
        try {
          const normalized = this.normalizer.normalize(item, {
            connectorId: input.connectorId,
            scope,
          });
          if (!normalized) {
            stats.skipped += 1;
            continue;
          }

          const existing = await this.refStore.findByExternalRef(
            input.connectorId,
            item.externalId,
            scope,
          );

          if (existing && existing.externalUpdatedAt >= item.updatedAt) {
            stats.skipped += 1;
            continue;
          }

          if (input.dryRun) {
            if (existing) stats.updated += 1;
            else stats.created += 1;
            continue;
          }

          if (existing) {
            await this.memoryService.updateMemory(scope, existing.memoryId, {
              title: normalized.title,
              content: normalized.content,
              summary: normalized.summary,
              tags: normalized.tags,
              project: normalized.project,
              notes: normalized.notes,
            });
            await this.refStore.upsert({
              connectorId: input.connectorId,
              externalId: item.externalId,
              memoryId: existing.memoryId,
              ownerId: scope.ownerId,
              workspaceId: scope.workspaceId,
              externalUpdatedAt: item.updatedAt,
              updatedAt: nowISO(),
            });
            stats.updated += 1;
          } else {
            const memory = await this.memoryService.createMemory(scope, {
              title: normalized.title,
              content: normalized.content,
              summary: normalized.summary,
              tags: normalized.tags,
              project: normalized.project,
              notes: normalized.notes,
              level: 'note',
              favorite: false,
            });
            await this.refStore.upsert({
              connectorId: input.connectorId,
              externalId: item.externalId,
              memoryId: memory.id,
              ownerId: scope.ownerId,
              workspaceId: scope.workspaceId,
              externalUpdatedAt: item.updatedAt,
              updatedAt: nowISO(),
            });
            stats.created += 1;
          }
        } catch {
          stats.failed += 1;
        }
      }

      const finishedAt = nowISO();
      const run: FabricIngestRun = {
        id: runId,
        connectorId: input.connectorId,
        mode: input.mode,
        status: 'completed',
        ownerId: scope.ownerId,
        workspaceId: scope.workspaceId,
        stats,
        startedAt,
        finishedAt,
      };

      await this.ingestStore.completeRun(runId, {
        status: 'completed',
        stats,
        finishedAt,
      });

      if (!input.dryRun && pullResult.nextCursor) {
        await this.refStore.setCursor(input.connectorId, scope, pullResult.nextCursor, runId);
      }

      return run;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const finishedAt = nowISO();
      await this.ingestStore.completeRun(runId, {
        status: 'failed',
        stats: emptyStats,
        finishedAt,
        errorMessage: message,
      });
      throw error;
    }
  }

  async listRuns(limit?: number): Promise<FabricIngestRun[]> {
    return this.ingestStore.listRuns(limit);
  }

  listConnectors(): ConnectorDescriptor[] {
    return CONNECTOR_IDS.map((id) => ({
      id,
      displayName: CONNECTOR_LABELS[id],
      configured: this.connectors.get(id)?.isConfigured() ?? false,
    }));
  }

  async getConnectorState(connectorId: ConnectorId, scope: MemoryScope) {
    return this.refStore.getConnectorState(connectorId, scope);
  }

  async getStatus(): Promise<KnowledgeFabricStatusResult> {
    const connectors = this.listConnectors();
    return {
      enabled: true,
      connectorCount: connectors.length,
      configuredConnectors: connectors.filter((c) => c.configured).map((c) => c.id),
    };
  }
}

export class NoOpKnowledgeFabricOrchestrator implements IKnowledgeFabricOrchestrator {
  async ingest(): Promise<FabricIngestRun> {
    throw new Error('Knowledge fabric platform disabled');
  }

  async listRuns(): Promise<FabricIngestRun[]> {
    return [];
  }

  listConnectors(): ConnectorDescriptor[] {
    return CONNECTOR_IDS.map((id) => ({
      id,
      displayName: id,
      configured: false,
    }));
  }

  async getConnectorState() {
    return null;
  }

  async getStatus(): Promise<KnowledgeFabricStatusResult> {
    return { enabled: false, connectorCount: 0, configuredConnectors: [] };
  }
}
