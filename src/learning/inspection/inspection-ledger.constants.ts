/** Minimum resolved inspection events sharing a pattern key before ledger upsert. */
export const INSPECTION_MIN_EVIDENCE_COUNT = 2;

/** Distinct workspaces confirming the same pattern key before Charter promotion. */
export const INSPECTION_CHARTER_WORKSPACE_THRESHOLD = 3;

export const INSPECTION_AGING_DAYS = 90;
export const INSPECTION_DECAY_POINTS = 10;
export const INSPECTION_ARCHIVE_CONFIDENCE = 20;
export const INSPECTION_LOW_CONFIDENCE = 30;
export const INSPECTION_BASE_CONFIDENCE = 40;
export const INSPECTION_CONFIDENCE_PER_EVIDENCE = 15;
export const INSPECTION_MAX_CONFIDENCE = 100;

export const INSPECTION_MAJOR_SEVERITIES = ['constitutional', 'critical', 'major'] as const;
