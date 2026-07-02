import type { Memory } from '../types/memory.js';
import type { ScoredMemory } from '../search/search.service.js';
import { formatWIB } from './format-wib.js';

export interface MemoryResponse extends Memory {
  createdAtWib: string;
  updatedAtWib: string;
}

export interface ScoredMemoryResponse extends MemoryResponse {
  relevanceScore: number;
}

export function toMemoryResponse(memory: Memory): MemoryResponse {
  return {
    ...memory,
    createdAtWib: formatWIB(memory.createdAt),
    updatedAtWib: formatWIB(memory.updatedAt),
  };
}

export function toScoredMemoryResponse(memory: ScoredMemory): ScoredMemoryResponse {
  return {
    ...toMemoryResponse(memory),
    relevanceScore: memory.relevanceScore,
  };
}

export function toMemoryListResponse(result: {
  memories: Memory[];
  total: number;
}): { memories: MemoryResponse[]; total: number } {
  return {
    memories: result.memories.map(toMemoryResponse),
    total: result.total,
  };
}

export function toSearchResponse(result: {
  memories: ScoredMemory[];
  total: number;
}): { memories: ScoredMemoryResponse[]; total: number } {
  return {
    memories: result.memories.map(toScoredMemoryResponse),
    total: result.total,
  };
}

export function toBackupResponse(result: {
  memories: Memory[];
}): { memories: MemoryResponse[] } {
  return {
    memories: result.memories.map(toMemoryResponse),
  };
}
