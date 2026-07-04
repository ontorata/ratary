import type { MemoryLevel } from '../../types/memory-level.js';
import type { MemoryScope } from '../../types/memory-scope.js';

export interface CompressionCandidate {
  memory: {
    id: string;
    title: string;
    content: string;
    summary: string;
    level: MemoryLevel;
    semanticHash: string | null;
  };
  duplicateClusterSize?: number;
  totalChars?: number;
}

export interface CompressionContext {
  scope: MemoryScope;
  deploymentLimits: { maxMemoryContentBytes: number };
}

export interface CompressionMetadata {
  algorithm: string;
  version: number;
  sourceMemoryIds: string[];
  charRatio?: number;
  tokenEstimateBefore?: number;
  tokenEstimateAfter?: number;
  compressedAt: string;
}

export interface CompressionJobOptions {
  dryRun?: boolean;
  projectId?: string;
}

export interface CompressionJobReport {
  candidates: number;
  compressed: number;
  dryRun: boolean;
}

export interface CompressionStatusQuery {
  projectId?: string;
}

export interface CompressionOwnerStatus {
  ownerId: string;
  projectId: string | null;
  compressionEnabled: boolean;
  compressionPolicy: string;
  compressionScheduler: string;
  counts: {
    activeNotesAndRaw: number;
    summaryMemories: number;
    canonicalMemories: number;
    withCompressionMeta: number;
    archivedMemories: number;
  };
  pending: {
    duplicateMemories: number;
    compressibleClusters: number;
  };
  lastCompressedAt: string | null;
}
