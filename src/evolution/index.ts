export type {
  MemorySnapshot,
  MemoryVersionRecord,
  MemoryHeadRecord,
  MemoryVersionFieldChange,
  MemoryVersionDiff,
  EvolutionScope,
} from './memory-evolution.types.js';
export { toMemorySnapshot } from './memory-evolution.types.js';
export type { IMemoryVersionStore } from './imemory-version-store.port.js';
export type { IMemoryHeadStore } from './imemory-head-store.port.js';
export type { IMemoryDiffEngine } from './imemory-diff-engine.interface.js';
export type { IMemoryMergePolicy } from './imemory-merge-policy.interface.js';
export type { IVersionConfidenceScorer } from './iversion-confidence-scorer.interface.js';
export type { IMemoryEvolutionCoordinator } from './memory-evolution-coordinator.js';
export {
  EVOLUTION_DEFAULT_BRANCH,
  EVOLUTION_MIN_MERGE_CONFIDENCE,
} from './memory-evolution.constants.js';
export { DefaultMemoryDiffEngine } from './default-memory-diff-engine.js';
export { DefaultMemoryMergePolicy } from './default-memory-merge-policy.js';
export { DefaultVersionConfidenceScorer } from './default-version-confidence-scorer.js';
export {
  MemoryEvolutionCoordinator,
  NoOpMemoryEvolutionCoordinator,
} from './memory-evolution-coordinator.js';
export { MemoryEvolutionService } from './memory-evolution.service.js';
