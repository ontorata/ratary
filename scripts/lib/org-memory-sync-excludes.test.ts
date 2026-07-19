import { describe, expect, it } from 'vitest';
import {
  DEFAULT_INGEST_EXCLUDE_PATTERNS,
  shouldExcludeIngestFile,
} from './org-memory-sync-excludes.js';

describe('org-memory-sync-excludes', () => {
  it('excludes known pilot .gitkeep placeholders', () => {
    for (const path of DEFAULT_INGEST_EXCLUDE_PATTERNS) {
      if (path === '**/.gitkeep') continue;
      expect(shouldExcludeIngestFile(path).excluded).toBe(true);
    }
  });

  it('excludes any .gitkeep via glob pattern', () => {
    expect(
      shouldExcludeIngestFile('.ai/reviews/pilot-001/g3/evidence/loi/.gitkeep').reason,
    ).toBe('**/.gitkeep');
  });

  it('does not exclude real markdown evidence files', () => {
    expect(
      shouldExcludeIngestFile('.ai/reviews/org-memory-dogfood/ingestion-log.md').excluded,
    ).toBe(false);
  });
});
