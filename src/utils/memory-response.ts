import type { Memory } from '../types/memory.js';
import type { ScoredMemory } from '../search/search.service.js';
import type { PrecisionSearchHit } from '../types/precision-search.js';
import { formatWIB } from './format-wib.js';

export interface MemoryResponse extends Memory {
  createdAtWib: string;
  updatedAtWib: string;
}

export interface ScoredMemoryResponse extends MemoryResponse {
  relevanceScore: number;
  snippet?: string;
  outgoingLinks?: PrecisionSearchHit['outgoingLinks'];
  backlinks?: PrecisionSearchHit['backlinks'];
}

export function toMemoryResponse(memory: Memory): MemoryResponse {
  const { lifecycleState, ...rest } = memory;
  const response: MemoryResponse = {
    ...rest,
    createdAtWib: formatWIB(memory.createdAt),
    updatedAtWib: formatWIB(memory.updatedAt),
  };
  if (lifecycleState != null) {
    response.lifecycleState = lifecycleState;
  }
  return response;
}

export function toScoredMemoryResponse(
  memory: ScoredMemory & Partial<PrecisionSearchHit>,
): ScoredMemoryResponse {
  const response: ScoredMemoryResponse = {
    ...toMemoryResponse(memory),
    relevanceScore: memory.relevanceScore,
  };
  if (memory.snippet) response.snippet = memory.snippet;
  if (memory.outgoingLinks) response.outgoingLinks = memory.outgoingLinks;
  if (memory.backlinks) response.backlinks = memory.backlinks;
  return response;
}

export function toMemoryListResponse(result: { memories: Memory[]; total: number }): {
  memories: MemoryResponse[];
  total: number;
} {
  return {
    memories: result.memories.map(toMemoryResponse),
    total: result.total,
  };
}

export function toSearchResponse(result: {
  memories: Array<ScoredMemory & Partial<PrecisionSearchHit>>;
  total: number;
  mode?: string;
  warnings?: string[];
}): {
  memories: ScoredMemoryResponse[];
  total: number;
  mode?: string;
  warnings?: string[];
} {
  return {
    memories: result.memories.map(toScoredMemoryResponse),
    total: result.total,
    ...(result.mode ? { mode: result.mode } : {}),
    ...(result.warnings ? { warnings: result.warnings } : {}),
  };
}

export function toBackupResponse(result: { memories: Memory[] }): { memories: MemoryResponse[] } {
  return {
    memories: result.memories.map(toMemoryResponse),
  };
}
