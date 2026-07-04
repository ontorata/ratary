import type { Memory } from '../types/memory.js';
import type { MemoryScope } from '../types/memory-scope.js';

export interface MemorySnapshot {
  title: string;
  project: string;
  content: string;
  summary: string;
  tags: string[];
  keywords: string[];
  category: string;
  memoryType: string;
  importance: number;
  language: string;
  notes: string;
  favorite: boolean;
  archived: boolean;
  level: string;
}

export interface MemoryVersionRecord {
  id: string;
  memoryId: string;
  ownerId: string;
  versionNumber: number;
  snapshot: MemorySnapshot;
  createdBy: string | null;
  mergeParentIds: string[];
  confidence: number;
  createdAt: string;
}

export interface MemoryHeadRecord {
  memoryId: string;
  ownerId: string;
  currentVersion: number;
  branchName: string;
  updatedAt: string;
}

export interface MemoryVersionFieldChange {
  field: keyof MemorySnapshot;
  before: unknown;
  after: unknown;
}

export interface MemoryVersionDiff {
  memoryId: string;
  fromVersion: number | 'current';
  toVersion: number | 'current';
  changes: MemoryVersionFieldChange[];
  confidence: number;
}

export type EvolutionScope = MemoryScope;

export function toMemorySnapshot(memory: Memory): MemorySnapshot {
  return {
    title: memory.title,
    project: memory.project,
    content: memory.content,
    summary: memory.summary,
    tags: [...memory.tags],
    keywords: [...memory.keywords],
    category: memory.category,
    memoryType: memory.memoryType,
    importance: memory.importance,
    language: memory.language,
    notes: memory.notes,
    favorite: memory.favorite,
    archived: memory.archived,
    level: memory.level,
  };
}
