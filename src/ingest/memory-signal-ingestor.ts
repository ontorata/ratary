import type { IMemoryRepository } from '../repositories/memory.repository.interface.js';
import type { MemoryScope } from '../types/memory-scope.js';
import { NotFoundError } from '../types/errors.js';
import type { IMemorySignalIngestor } from './imemory-signal-ingestor.interface.js';
import { ImportanceScoringPolicy } from './importance-scoring-policy.js';
import type { IngestResult, MemoryQualitySignal } from './memory-quality-signal.types.js';
import type { IMemorySignalStore } from '../ports/signals/imemory-signal-store.port.js';

export class MemorySignalIngestor implements IMemorySignalIngestor {
  private readonly scoring = new ImportanceScoringPolicy();

  constructor(
    private readonly repository: IMemoryRepository,
    private readonly signalStore?: IMemorySignalStore,
  ) {}

  async ingest(scope: MemoryScope, signal: MemoryQualitySignal): Promise<IngestResult> {
    if (signal.ownerId !== scope.ownerId) {
      throw new NotFoundError('Memory');
    }

    if (this.signalStore && (await this.signalStore.exists(signal.signalId))) {
      return { accepted: false, duplicate: true };
    }

    if (signal.signalType === 'consolidation_hint') {
      if (this.signalStore) {
        await this.signalStore.append(signal);
      }
      return { accepted: true, duplicate: false, appliedDelta: 0 };
    }

    if (!signal.memoryId) {
      return { accepted: false, duplicate: false };
    }

    const memory = await this.repository.findById(
      signal.memoryId,
      scope.ownerId,
      scope.workspaceId,
    );
    if (!memory) {
      throw new NotFoundError('Memory', signal.memoryId);
    }

    const delta = this.scoring.score(signal, memory);
    if (delta === 0) {
      if (this.signalStore) {
        await this.signalStore.append(signal);
      }
      return { accepted: true, duplicate: false, appliedDelta: 0 };
    }

    const nextImportance = this.scoring.applyDelta(memory.importance, delta);
    await this.repository.bumpImportance(
      signal.memoryId,
      scope.ownerId,
      nextImportance,
      scope.workspaceId,
    );

    if (this.signalStore) {
      await this.signalStore.append(signal);
    }

    return { accepted: true, duplicate: false, appliedDelta: delta };
  }
}
