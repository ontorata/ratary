import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  appendDogfoodSession,
  countDogfoodSessions,
  OPERATIONAL_USAGE_LOG_SCHEMA_VERSION,
} from './operational-usage-log.js';

describe('operational-usage-log', () => {
  let tempRoot: string;

  beforeEach(async () => {
    tempRoot = await mkdtemp(join(tmpdir(), 'ratary-p1e-'));
    vi.stubEnv('INIT_CWD', tempRoot);
    vi.spyOn(process, 'cwd').mockReturnValue(tempRoot);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await rm(tempRoot, { recursive: true, force: true });
  });

  it('creates schema header and appends a fixture session block', async () => {
    const entry = await appendDogfoodSession({
      sessionId: 'test-session-001',
      timestamp: '2026-07-19T00:00:00.000Z',
      operator: 'fixture',
      tools: ['search_memory', 'save_memory'],
      querySummary: 'phase-4 handoff',
      outcome: 'success',
      durationMs: 42,
    });

    expect(entry.sessionId).toBe('test-session-001');
    const content = await readFile(
      join(tempRoot, '.ai/reviews/org-memory-dogfood/operational-usage-log.md'),
      'utf-8',
    );
    expect(content).toContain(`schema_version=${OPERATIONAL_USAGE_LOG_SCHEMA_VERSION}`);
    expect(content).toContain('tools=search_memory,save_memory');
    expect(countDogfoodSessions(content)).toBe(1);
  });
});
