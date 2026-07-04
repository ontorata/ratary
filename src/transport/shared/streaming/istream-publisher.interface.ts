import type { ContextChunk } from './context-chunk.types.js';

/** Protocol-side port — implemented by SSE / WebSocket / gRPC adapters. */
export interface IStreamPublisher<TChunk = ContextChunk> {
  publish(chunk: TChunk): Promise<void>;
  close(reason?: string): Promise<void>;
}
