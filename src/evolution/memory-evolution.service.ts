import type { IMemoryReader, IMemoryWriter } from '../repositories/memory.repository.interface.js';
import type { IMemoryVersionStore } from './imemory-version-store.port.js';
import type { IMemoryHeadStore } from './imemory-head-store.port.js';
import type { IMemoryDiffEngine } from './imemory-diff-engine.interface.js';
import type { IVersionConfidenceScorer } from './iversion-confidence-scorer.interface.js';
import type { IMemoryMergePolicy } from './imemory-merge-policy.interface.js';
import type { IMemoryEvolutionCoordinator } from './memory-evolution-coordinator.js';
import type {
  EvolutionScope,
  MemoryHeadRecord,
  MemorySnapshot,
  MemoryVersionDiff,
  MemoryVersionRecord,
} from './memory-evolution.types.js';
import { toMemorySnapshot } from './memory-evolution.types.js';
import type { Memory } from '../types/memory.js';
import type { MemoryLevel } from '../types/memory-level.js';
import type { UpdateMemoryData } from '../types/memory-persistence.js';
import { NotFoundError } from '../types/errors.js';
import { workspaceIdFromScope } from '../repositories/repository-scope.js';

function snapshotToUpdateData(snapshot: MemorySnapshot): UpdateMemoryData {
  return {
    title: snapshot.title,
    project: snapshot.project,
    content: snapshot.content,
    summary: snapshot.summary,
    tags: [...snapshot.tags],
    keywords: [...snapshot.keywords],
    category: snapshot.category,
    memoryType: snapshot.memoryType,
    importance: snapshot.importance,
    language: snapshot.language,
    notes: snapshot.notes,
    favorite: snapshot.favorite,
    archived: snapshot.archived,
    level: snapshot.level as MemoryLevel,
  };
}

export class MemoryEvolutionService {
  constructor(
    private readonly memoryReader: IMemoryReader,
    private readonly memoryWriter: IMemoryWriter,
    private readonly versionStore: IMemoryVersionStore,
    private readonly headStore: IMemoryHeadStore,
    private readonly diffEngine: IMemoryDiffEngine,
    private readonly confidenceScorer: IVersionConfidenceScorer,
    private readonly mergePolicy: IMemoryMergePolicy,
    private readonly coordinator: IMemoryEvolutionCoordinator,
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

  /** D97-01 — restore current head from an immutable version snapshot. */
  async restoreToVersion(
    scope: EvolutionScope,
    memoryId: string,
    versionNumber: number,
  ): Promise<Memory> {
    const workspaceId = workspaceIdFromScope(scope);
    const current = await this.loadMemoryWithContent(memoryId, scope.ownerId, workspaceId);
    const version = await this.versionStore.getVersion(memoryId, scope.ownerId, versionNumber);
    if (!version) {
      throw new NotFoundError('MemoryVersion', String(versionNumber));
    }

    await this.coordinator.onMemoryUpdated(scope, current);
    const updated = await this.memoryWriter.update(
      memoryId,
      scope.ownerId,
      snapshotToUpdateData(version.snapshot),
      workspaceId,
    );
    if (!updated) {
      throw new NotFoundError('Memory', memoryId);
    }
    return updated;
  }

  /** D97-02 — merge two version snapshots and apply to current head. */
  async mergeVersions(
    scope: EvolutionScope,
    memoryId: string,
    baseVersion: number,
    incomingVersion: number | 'current',
  ): Promise<Memory> {
    const workspaceId = workspaceIdFromScope(scope);
    const current = await this.loadMemoryWithContent(memoryId, scope.ownerId, workspaceId);
    const baseRecord = await this.versionStore.getVersion(memoryId, scope.ownerId, baseVersion);
    if (!baseRecord) {
      throw new NotFoundError('MemoryVersion', String(baseVersion));
    }

    const incomingSnapshot =
      incomingVersion === 'current'
        ? toMemorySnapshot(current)
        : (await this.versionStore.getVersion(memoryId, scope.ownerId, incomingVersion))?.snapshot;

    if (!incomingSnapshot) {
      throw new NotFoundError('MemoryVersion', String(incomingVersion));
    }

    const merged = this.mergePolicy.merge(baseRecord.snapshot, incomingSnapshot);
    await this.coordinator.onMemoryUpdated(scope, current);
    const updated = await this.memoryWriter.update(
      memoryId,
      scope.ownerId,
      snapshotToUpdateData(merged),
      workspaceId,
    );
    if (!updated) {
      throw new NotFoundError('Memory', memoryId);
    }
    return updated;
  }

  private async loadMemoryWithContent(
    memoryId: string,
    ownerId: string,
    workspaceId?: string,
  ): Promise<Memory> {
    const [memory] = await this.memoryReader.findByIdsWithContent([memoryId], ownerId, workspaceId);
    if (!memory) {
      throw new NotFoundError('Memory', memoryId);
    }
    return memory;
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
