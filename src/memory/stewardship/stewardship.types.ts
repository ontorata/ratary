/**
 * Self-Managing Memory Stewardship (Phase 04.7 · ADR-045).
 * Deterministic maintenance pipeline — no planner, no agent, no LLM.
 */

/** Fixed maintenance stages, executed in this exact order. */
export const STEWARDSHIP_STAGE_ORDER = [
  'metadata-repair',
  'duplicate-detection',
  'merge-compress',
  'archive',
  'graph-repair',
  'embedding-repair',
  'index-repair',
  'ranking-refresh',
  'retrieval-optimization',
  'decay-scoring',
  'entity-resolution',
] as const;

export type StewardshipStage = (typeof STEWARDSHIP_STAGE_ORDER)[number];

export const STAGE_INDEX: Readonly<Record<StewardshipStage, number>> = Object.freeze(
  STEWARDSHIP_STAGE_ORDER.reduce(
    (acc, stage, index) => {
      acc[stage] = index;
      return acc;
    },
    {} as Record<StewardshipStage, number>,
  ),
);

export type MaintenanceTaskStatus = 'ok' | 'skipped' | 'error';
