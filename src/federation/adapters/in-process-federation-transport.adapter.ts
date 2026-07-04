import { createHash } from 'node:crypto';
import type { IMemoryRepository } from '../../repositories/memory.repository.interface.js';
import { nowISO } from '../../utils/memory-mapper.js';
import type { IFederationTransport } from '../ports/ifederation-transport.port.js';
import type { IFederationRegistry } from '../ports/ifederation-registry.port.js';
import type {
  FederatedMemoryBundle,
  FederatedMemoryRecord,
} from '../types/federated-memory.bundle.js';
import type {
  FederationPullRequest,
  FederationPushResult,
} from '../types/federation-exchange.types.js';

function hashBundle(memories: FederatedMemoryRecord[]): string {
  return createHash('sha256').update(JSON.stringify(memories)).digest('hex');
}

/** Same-node transport — exports via repository, no network (ADR-029 Phase 14). */
export class InProcessFederationTransport implements IFederationTransport {
  constructor(
    private readonly registry: IFederationRegistry,
    private readonly memoryRepository: IMemoryRepository,
  ) {}

  async pull(request: FederationPullRequest): Promise<FederatedMemoryBundle> {
    const local = await this.registry.getLocal();
    if (!local || request.source.nodeId !== local.nodeId) {
      throw new Error('InProcessFederationTransport only supports local-node pull');
    }

    const workspaceId = request.source.workspaceId;
    const ownerId = request.source.ownerId;
    const limit = request.limit ?? 50;

    let memories;
    if (request.memoryIds?.length) {
      memories = (
        await Promise.all(
          request.memoryIds.map((id) =>
            this.memoryRepository.findById(
              id,
              request.source.ownerId,
              request.source.workspaceId,
            ),
          ),
        )
      ).filter((m): m is NonNullable<typeof m> => m != null);
    } else {
      memories = await this.memoryRepository.findUpdatedSince({
        ownerId,
        workspaceId,
        since: request.cursor ?? '',
        limit,
      });
    }

    const records: FederatedMemoryRecord[] = memories.map((memory) => ({
      sourceMemoryId: memory.id,
      codename: memory.codename ?? undefined,
      slug: memory.slug ?? undefined,
      title: memory.title,
      summary: memory.summary,
      body: memory.content,
      metadata: {
        project: memory.project,
        tags: memory.tags,
        favorite: memory.favorite,
        level: memory.level,
      },
      updatedAt: memory.updatedAt,
    }));

    return {
      bundleId: crypto.randomUUID(),
      source: request.source,
      target: request.target,
      memories: records,
      exportedAt: nowISO(),
      contentHash: hashBundle(records),
    };
  }

  async push(bundle: FederatedMemoryBundle): Promise<FederationPushResult> {
    const local = await this.registry.getLocal();
    if (!local || bundle.target.nodeId !== local.nodeId) {
      throw new Error('InProcessFederationTransport only supports local-node push');
    }
    // Push is a no-op at transport layer — KnowledgeExchangeService applies locally on pull path.
    // For symmetric API, accept bundle size as accepted count when target is local.
    return { accepted: bundle.memories.length, rejected: 0 };
  }
}

export function scopeRefFromPull(request: FederationPullRequest): {
  workspaceId?: string;
} {
  return {
    workspaceId: request.source.workspaceId,
  };
}
