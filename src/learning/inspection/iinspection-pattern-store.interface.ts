import type { MemoryScope } from '../../types/memory-scope.js';
import type {
  InspectionPattern,
  InspectionPatternContradiction,
  InspectionPatternScope,
} from './inspection-pattern.types.js';

export interface IInspectionPatternStore {
  upsert(pattern: InspectionPattern): Promise<InspectionPattern>;
  findByPatternKey(
    scope: MemoryScope,
    patternKey: string,
    patternScope: InspectionPatternScope,
  ): Promise<InspectionPattern | null>;
  list(scope: MemoryScope, options?: { includeArchived?: boolean }): Promise<InspectionPattern[]>;
  listActiveForRecall(scope: MemoryScope, pathPrefix?: string): Promise<InspectionPattern[]>;
  appendEventLink(patternId: string, signalId: string, observedAt: string): Promise<void>;
  recordContradiction(contradiction: InspectionPatternContradiction): Promise<void>;
  listContradictions(scope: MemoryScope): Promise<InspectionPatternContradiction[]>;
  countWorkspacesByPatternKey(ownerId: string, patternKey: string): Promise<number>;
  updateLifecycle(
    patternId: string,
    updates: Pick<
      InspectionPattern,
      'confidence' | 'lifecycleState' | 'lastConfirmedAt' | 'updatedAt'
    >,
  ): Promise<void>;
}
