/** Minimum confidence to persist an inferred relation. */
export const RELATION_INFERENCE_MIN_CONFIDENCE = 0.3;

/** Max inferred relations per orchestrator run (safety cap). */
export const RELATION_INFERENCE_MAX_CANDIDATES = 500;

/** Memories created within this window (days) qualify for temporal proximity. */
export const TEMPORAL_PROXIMITY_DAYS = 7;

/** Default confidence for project co-occurrence edges. */
export const PROJECT_COOCCURRENCE_CONFIDENCE = 0.6;

/** Default confidence for shared-tag edges (scaled by overlap). */
export const SHARED_TAG_BASE_CONFIDENCE = 0.5;

/** Default confidence for temporal proximity edges. */
export const TEMPORAL_PROXIMITY_CONFIDENCE = 0.4;
