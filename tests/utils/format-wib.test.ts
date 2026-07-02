import { describe, expect, it } from 'vitest';
import { formatWIB } from '../../src/utils/format-wib.js';
import { toMemoryResponse } from '../../src/utils/memory-response.js';
import type { Memory } from '../../src/types/memory.js';

describe('formatWIB', () => {
  it('converts UTC midnight to 07:00 WIB', () => {
    expect(formatWIB('2026-07-02T00:00:00.000Z')).toBe('2026-07-02 07:00:00 WIB');
  });

  it('converts afternoon UTC to evening WIB same day', () => {
    expect(formatWIB('2026-07-02T14:30:45.000Z')).toBe('2026-07-02 21:30:45 WIB');
  });

  it('rolls date forward when UTC is late evening', () => {
    expect(formatWIB('2026-07-02T20:00:00.000Z')).toBe('2026-07-03 03:00:00 WIB');
  });

  it('returns input unchanged for invalid timestamps', () => {
    expect(formatWIB('not-a-date')).toBe('not-a-date');
  });
});

describe('toMemoryResponse', () => {
  const base: Memory = {
    id: '00000000-0000-4000-8000-000000000001',
    codename: 'NOTE-0001',
    slug: 'note-0001',
    title: 'Test',
    project: '',
    content: 'Body',
    summary: '',
    keywords: [],
    category: '',
    memoryType: 'note',
    importance: 50,
    language: 'id',
    notes: '',
    tags: [],
    favorite: false,
    archived: false,
    ownerId: 'owner-1',
    projectId: 'note-0001',
    level: 'note',
    lastAccessed: null,
    accessCount: 0,
    embeddingId: null,
    objectKey: null,
    semanticHash: null,
    createdAt: '2026-07-02T00:00:00.000Z',
    updatedAt: '2026-07-02T14:30:45.000Z',
  };

  it('adds WIB display fields without changing UTC timestamps', () => {
    const response = toMemoryResponse(base);

    expect(response.createdAt).toBe('2026-07-02T00:00:00.000Z');
    expect(response.updatedAt).toBe('2026-07-02T14:30:45.000Z');
    expect(response.createdAtWib).toBe('2026-07-02 07:00:00 WIB');
    expect(response.updatedAtWib).toBe('2026-07-02 21:30:45 WIB');
  });
});
