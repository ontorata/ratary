import type { IMemoryRepository } from '../../repositories/memory.repository.interface.js';
import type { IMemoryRelationRepository } from '../../repositories/memory-relation.repository.interface.js';
import type { MemoryScope } from '../../types/memory-scope.js';
import { workspaceIdFromScope } from '../../repositories/repository-scope.js';
import type { ScoredMemory } from '../ranker.js';

const DEFAULT_SEED_COUNT = 3;

/** One-hop relation neighbor summaries for progressive retrieval relations stage. */
export async function expandWithRelationNeighbors(
  repository: IMemoryRepository,
  relationRepository: IMemoryRelationRepository,
  scope: MemoryScope,
  ranked: ScoredMemory[],
  neighborCap: number,
  seedCount = DEFAULT_SEED_COUNT,
): Promise<ScoredMemory[]> {
  if (ranked.length === 0 || neighborCap <= 0) {
    return ranked;
  }

  const seen = new Set(ranked.map((memory) => memory.id));
  const neighborIds: string[] = [];
  const workspaceId = workspaceIdFromScope(scope);
  const seeds = ranked.slice(0, Math.min(seedCount, ranked.length));

  for (const seed of seeds) {
    const relations = await relationRepository.findByMemoryId(
      seed.id,
      scope.ownerId,
      workspaceId,
    );

    for (const relation of relations) {
      const neighborId =
        relation.sourceMemoryId === seed.id
          ? relation.targetMemoryId
          : relation.sourceMemoryId;

      if (seen.has(neighborId)) {
        continue;
      }

      seen.add(neighborId);
      neighborIds.push(neighborId);
      if (neighborIds.length >= neighborCap) {
        break;
      }
    }

    if (neighborIds.length >= neighborCap) {
      break;
    }
  }

  if (neighborIds.length === 0) {
    return ranked;
  }

  const neighbors = await repository.findByIds(neighborIds, scope.ownerId, workspaceId);
  const neighborScored: ScoredMemory[] = neighbors.map((memory) => ({
    ...memory,
    content: '',
    relevanceScore: 0,
  }));

  return [...ranked, ...neighborScored];
}
