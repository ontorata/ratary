import { describe, it, expect } from 'vitest';
import { DefaultMemoryDiffEngine } from '../../src/evolution/default-memory-diff-engine.js';
import type { MemorySnapshot } from '../../src/evolution/memory-evolution.types.js';

const snapshot = (overrides: Partial<MemorySnapshot> = {}): MemorySnapshot => ({
  title: 'Title',
  project: 'p',
  content: 'content',
  summary: 'summary',
  tags: ['a'],
  keywords: [],
  category: '',
  memoryType: 'note',
  importance: 50,
  language: 'id',
  notes: '',
  favorite: false,
  archived: false,
  level: 'note',
  ...overrides,
});

describe('DefaultMemoryDiffEngine', () => {
  const engine = new DefaultMemoryDiffEngine();

  it('detects changed fields', () => {
    const diff = engine.diff(
      'mem-1',
      1,
      'current',
      snapshot({ title: 'Old' }),
      snapshot({ title: 'New', content: 'updated' }),
    );

    expect(diff.changes.map((change) => change.field)).toEqual(['title', 'content']);
  });

  it('returns empty changes for identical snapshots', () => {
    const base = snapshot();
    const diff = engine.diff('mem-1', 1, 2, base, base);
    expect(diff.changes).toHaveLength(0);
  });
});
