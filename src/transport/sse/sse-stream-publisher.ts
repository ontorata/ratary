import type { ServerResponse } from 'node:http';
import type { ContextChunk } from '../shared/streaming/context-chunk.types.js';
import type { IStreamPublisher } from '../shared/streaming/istream-publisher.interface.js';

/** Writes MCP-style SSE events for context stream chunks. */
export class SseStreamPublisher implements IStreamPublisher<ContextChunk> {
  private closed = false;

  constructor(private readonly res: ServerResponse) {}

  async publish(chunk: ContextChunk): Promise<void> {
    if (this.closed) return;
    const event = chunk.type === 'done' ? 'done' : chunk.type === 'metadata' ? 'meta' : 'chunk';
    this.res.write(`event: ${event}\n`);
    this.res.write(`data: ${JSON.stringify(chunk)}\n\n`);
  }

  async close(reason?: string): Promise<void> {
    if (this.closed) return;
    this.closed = true;
    if (reason) {
      this.res.write(`event: error\n`);
      this.res.write(`data: ${JSON.stringify({ message: reason })}\n\n`);
    }
    this.res.end();
  }
}

export function writeSseHeaders(res: ServerResponse): void {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
}
