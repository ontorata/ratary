/** P1-E ingest exclude patterns — placeholders only; never skip real content. */
export const DEFAULT_INGEST_EXCLUDE_PATTERNS = [
  '**/.gitkeep',
  '.ai/reviews/pilot-001/g3/evidence/loi/.gitkeep',
  '.ai/reviews/pilot-001/g3/evidence/meetings/.gitkeep',
  '.ai/reviews/pilot-001/g3/evidence/outreach/.gitkeep',
  '.ai/reviews/pilot-001/g3/evidence/scope/.gitkeep',
] as const;

export type IngestExcludeDecision = {
  excluded: boolean;
  reason?: string;
};

export function normalizeIngestPath(filePath: string): string {
  return filePath.replace(/\\/g, '/').replace(/^\.\/+/, '');
}

export function shouldExcludeIngestFile(
  filePath: string,
  patterns: readonly string[] = DEFAULT_INGEST_EXCLUDE_PATTERNS,
): IngestExcludeDecision {
  const normalized = normalizeIngestPath(filePath);

  for (const pattern of patterns) {
    if (pattern === '**/.gitkeep') {
      if (normalized.endsWith('/.gitkeep') || normalized === '.gitkeep') {
        return { excluded: true, reason: pattern };
      }
      continue;
    }

    const patternNormalized = normalizeIngestPath(pattern);
    if (normalized === patternNormalized) {
      return { excluded: true, reason: pattern };
    }
  }

  return { excluded: false };
}
