export const SEARCH_CANDIDATE_CAP = 500;

export const RETRIEVAL_DEFAULT_LIMIT = 10;
export const RETRIEVAL_MAX_RANKED = 20;
export const RETRIEVAL_SQL_CAP = 60;
export const RETRIEVAL_CANDIDATE_CAP = 100;

export const RANKING_WEIGHTS = {
  codenameExact: 100,
  codenameContains: 80,
  titleExact: 90,
  titleContains: 70,
  aliasExact: 85,
  aliasContains: 65,
  keywordMatch: 60,
  tagMatch: 55,
  summaryContains: 50,
  projectExact: 40,
  projectContains: 25,
  contentContains: 20,
  favoriteBonus: 10,
} as const;

export const RETRIEVAL_WEIGHTS = {
  levelCanonical: 30,
  levelSummary: 20,
  levelNote: 10,
  levelRaw: 0,
  recencyDays7: 15,
  recencyDays30: 8,
  accessCountLog: 5,
} as const;

/**
 * Reciprocal Rank Fusion (RRF) configuration for hybrid retrieval.
 * Used by CompositeRetrievalCandidateSource to merge ranked candidates.
 * @see ADR-001 Multi-Source Retrieval
 */
import type { RetrievalSourceRole } from '../memory/retrieval-source.types.js';

export const RRF_CONFIG = {
  /** Standard RRF constant - higher = more equal rank distribution */
  K: 60,
  /** Per-source caps for two-leg modes (sql+vector or sql+graph). */
  SOURCE_CAPS: {
    sql: 50,
    vector: 50,
    graph: 50,
  },
  /** Per-source caps when sql, vector, and graph are all active (ADR-006 Appendix B). */
  SOURCE_CAPS_WITH_GRAPH_VECTOR: {
    sql: 40,
    vector: 40,
    graph: 30,
  },
  /** Per-source weights for weighted RRF - higher = more influence */
  SOURCE_WEIGHTS: {
    sql: 1.0,
    vector: 1.0,
    graph: 1.0,
  },
} as const;

/** Resolve per-source cap from active roles — not array index (ADR-006). */
export function getRrfSourceCap(
  role: RetrievalSourceRole,
  activeRoles: readonly RetrievalSourceRole[],
): number {
  const roles = new Set(activeRoles);
  if (roles.has('graph') && roles.has('vector')) {
    return RRF_CONFIG.SOURCE_CAPS_WITH_GRAPH_VECTOR[role];
  }
  return RRF_CONFIG.SOURCE_CAPS[role];
}

export function getRrfSourceWeight(role: RetrievalSourceRole): number {
  return RRF_CONFIG.SOURCE_WEIGHTS[role];
}
