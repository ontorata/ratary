import type { IMemoryReader } from '../repositories/memory.repository.interface.js';
import type { IMemoryVersionStore } from './imemory-version-store.port.js';
import type { IMemoryHeadStore } from './imemory-head-store.port.js';
import type { IMemoryDiffEngine } from './imemory-diff-engine.interface.js';
import type { IVersionConfidenceScorer } from './iversion-confidence-scorer.interface.js';
import type {
  EvolutionScope,
  MemoryHeadRecord,
  MemoryVersionDiff,
  MemoryVersionRecord,
} from './memory-evolution.types.js';
import { toMemorySnapshot } from './memory-evolution.types.js';
import { NotFoundError } from '../types/errors.js';
import { workspaceIdFromScope } from '../repositories/repository-scope.js';

export class MemoryEvolutionService {
  constructor(
    private readonly memoryReader: IMemoryReader,
    private readonly versionStore: IMemoryVersionStore,
    private readonly headStore: IMemoryHeadStore,
    private readonly diffEngine: IMemoryDiffEngine,
    private readonly confidenceScorer: IVersionConfidenceScorer,
  ) {}

  async listVersions(scope: EvolutionScope, memoryId: string): Promise<{
    head: MemoryHeadRecord | null;
    versions: MemoryVersionRecord[];
  }> {
    await this.assertMemoryExists(scope, memoryId);
    const [head, versions] = await Promise.all([
      this.headStore.getHead(memoryId, scope.ownerId),
      this.versionStore.listVersions(memoryId, scope.ownerId),
    ]);
    return { head, versions };
  }

  async diffVersions(
    scope: EvolutionScope,
    memoryId: string,
    fromVersion: number,
    against: number | 'current',
  ): Promise<MemoryVersionDiff> {
    const memory = await this.assertMemoryExists(scope, memoryId);
    const fromRecord = await this.versionStore.getVersion(memoryId, scope.ownerId, fromVersion);
    if (!fromRecord) {
      throw new NotFoundError('MemoryVersion', String(fromVersion));
    }

    const toSnapshot =
      against === 'current'
        ? toMemorySnapshot(memory)
        : (await this.versionStore.getVersion(memoryId, scope.ownerId, against))?.snapshot;

    if (!toSnapshot) {
      throw new NotFoundError('MemoryVersion', String(against));
    }

    const diff = this.diffEngine.diff(memoryId, fromVersion, against, fromRecord.snapshot, toSnapshot);
    return { ...diff, confidence: this.confidenceScorer.score(diff) };
  }

  private async assertMemoryExists(scope: EvolutionScope, memoryId: string) {
    const workspaceId = workspaceIdFromScope(scope);
    const memory = await this.memoryReader.findById(memoryId, scope.ownerId, workspaceId);
    if (!memory) {
      throw new NotFoundError('Memory', memoryId);
    }
    return memory;
  }
}
