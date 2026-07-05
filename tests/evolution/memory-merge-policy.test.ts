import { describe, it, expect } from 'vitest';
import { DefaultMemoryMergePolicy } from '../../src/evolution/default-memory-merge-policy.js';
import type { MemorySnapshot } from '../../src/evolution/memory-evolution.types.js';

describe('DefaultMemoryMergePolicy', () => {
  const policy = new DefaultMemoryMergePolicy();

  const base: MemorySnapshot = {
    title: 'Base',
    project: 'p',
    content: 'base content',
    summary: 'base summary',
    tags: ['a'],
    keywords: ['k1'],
    category: '',
    memoryType: 'note',
    importance: 40,
    language: 'id',
    notes: 'notes',
    favorite: false,
    archived: false,
    level: 'note',
  };

  it('merges incoming textual fields and unions tags', () => {
    const merged = policy.merge(base, {
      ...base,
      title: 'Incoming',
      content: 'incoming content',
      tags: ['b'],
      importance: 30,
    });

    expect(merged.title).toBe('Incoming');
    expect(merged.tags.sort()).toEqual(['a', 'b']);
    expect(merged.importance).toBe(40);
  });

  it('preserves base text when incoming fields are empty (no silent data loss)', () => {
    const merged = policy.merge(base, {
      ...base,
      title: '',
      content: '',
      summary: '',
      notes: '',
      tags: ['b'],
    });

    expect(merged.title).toBe('Base');
    expect(merged.content).toBe('base content');
    expect(merged.summary).toBe('base summary');
    expect(merged.notes).toBe('notes');
    expect(merged.tags.sort()).toEqual(['a', 'b']);
  });

  it('preserves base text when incoming fields are whitespace-only', () => {
    const merged = policy.merge(base, {
      ...base,
      title: '   ',
      content: '\n',
      summary: '  \t  ',
    });

    expect(merged.title).toBe('Base');
    expect(merged.content).toBe('base content');
    expect(merged.summary).toBe('base summary');
  });

  it('unions keywords without dropping base entries', () => {
    const merged = policy.merge(base, {
      ...base,
      keywords: ['k2'],
    });
    expect(merged.keywords.sort()).toEqual(['k1', 'k2']);
  });
});
