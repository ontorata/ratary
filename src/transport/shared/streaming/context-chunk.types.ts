/** Chunk types emitted by context stream adapters (ADR-028 Phase 13). */
export type ContextChunkType = 'summary' | 'memory' | 'metadata' | 'done';

export interface ContextChunk {
  readonly sequence: number;
  readonly type: ContextChunkType;
  readonly payload: unknown;
}
