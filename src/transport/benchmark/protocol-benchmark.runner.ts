import { performance } from 'node:perf_hooks';
import type { TransportHandlers } from '../shared/handlers/create-transport-handlers.js';
import type { TransportContext } from '../shared/transport-context.types.js';
import {
  buildProtocolBenchmarkReport,
  type BenchmarkSample,
  type ProtocolBenchmarkConfig,
  type ProtocolBenchmarkReport,
} from './protocol-benchmark.report.js';
import type { IStreamPublisher } from '../shared/streaming/istream-publisher.interface.js';
import type { ContextChunk } from '../shared/streaming/context-chunk.types.js';

export interface ProtocolBenchmarkRunnerDeps {
  handlers: TransportHandlers;
  ctx: TransportContext;
}

class CollectingPublisher implements IStreamPublisher<ContextChunk> {
  chunkCount = 0;

  async publish(_chunk: ContextChunk): Promise<void> {
    this.chunkCount += 1;
  }

  async close(): Promise<void> {
    // no-op
  }
}

/**
 * In-process protocol benchmark — handler path timings, not full wire servers.
 * Suitable for CI smoke and local comparison (ADR-028 Phase 13E).
 */
export async function runProtocolBenchmark(
  deps: ProtocolBenchmarkRunnerDeps,
  config: ProtocolBenchmarkConfig = { fixture: 'default', iterations: 5 },
): Promise<ProtocolBenchmarkReport> {
  const samples: BenchmarkSample[] = [];

  for (let i = 0; i < config.iterations; i += 1) {
    const searchStart = performance.now();
    await deps.handlers.memory.search.handle(deps.ctx, {
      q: 'handoff',
      limit: 10,
      offset: 0,
      archived: false,
    });
    samples.push({
      protocol: 'rest',
      mode: 'unary',
      durationMs: performance.now() - searchStart,
    });

    const grpcStart = performance.now();
    await deps.handlers.memory.search.handle({ ...deps.ctx, source: 'grpc' }, {
      q: 'handoff',
      limit: 10,
      offset: 0,
      archived: false,
    });
    samples.push({
      protocol: 'grpc',
      mode: 'unary',
      durationMs: performance.now() - grpcStart,
    });

    const streamStart = performance.now();
    const publisher = new CollectingPublisher();
    await deps.handlers.context.streamContext.handle(deps.ctx, {
      query: 'handoff',
      limit: 5,
      publisher,
    });
    samples.push({
      protocol: 'sse',
      mode: 'stream',
      durationMs: performance.now() - streamStart,
    });

    const wsStart = performance.now();
    await deps.handlers.context.streamContext.handle({ ...deps.ctx, source: 'websocket' }, {
      query: 'handoff',
      limit: 5,
      publisher: new CollectingPublisher(),
    });
    samples.push({
      protocol: 'websocket',
      mode: 'stream',
      durationMs: performance.now() - wsStart,
    });
  }

  return buildProtocolBenchmarkReport(config, samples);
}
