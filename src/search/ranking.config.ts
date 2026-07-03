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
export const RRF_CONFIG = {
  /** Standard RRF constant - higher = more equal rank distribution */
  K: 60,
  /** Per-source candidate caps (50% of RETRIEVAL_CANDIDATE_CAP each) */
  SOURCE_CAPS: {
    sql: 50,
    vector: 50,
  },
} as const;
