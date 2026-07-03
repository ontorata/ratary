import type { MemoryType } from './knowledge.js';
import type { MemoryLevel } from './memory-level.js';

export interface InsertMemoryData {
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
  codename: string;
  slug: string;
  favorite: boolean;
  archived?: boolean;
  ownerId?: string;
  workspaceId?: string;
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  projectId?: string;
  level?: MemoryLevel;
  semanticHash?: string | null;
  accessCount?: number;
  lastAccessed?: string | null;
}

export interface UpdateMemoryData {
  title?: string;
  project?: string;
  content?: string;
  summary?: string;
  tags?: string[];
  keywords?: string[];
  category?: string;
  memoryType?: string;
  importance?: number;
  language?: string;
  notes?: string;
  slug?: string;
  favorite?: boolean;
  archived?: boolean;
  projectId?: string;
  level?: MemoryLevel;
}

export interface ListFilters {
  ownerId: string;
  workspaceId?: string;
  project?: string;
  favorite?: boolean;
  archived?: boolean;
  limit: number;
  offset: number;
}

export interface SearchFilters {
  ownerId: string;
  workspaceId?: string;
  query?: string;
  tag?: string;
  project?: string;
  category?: string;
  memoryType?: MemoryType;
  importanceMin?: number;
  favorite?: boolean;
  archived?: boolean;
  limit: number;
  offset: number;
}
