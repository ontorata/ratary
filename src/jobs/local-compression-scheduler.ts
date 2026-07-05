import type { MemoryScope } from '../types/memory-scope.js';
import type {
  CompressionJobOptions,
  CompressionJobReport,
} from '../memory/compression/compression.types.js';
import type { ICompressionScheduler } from '../ports/compression/icompression-scheduler.port.js';
import { CompressionJobRunner } from '../jobs/compression-job-runner.js';

interface PendingCompressionJob {
  id: string;
  scope: MemoryScope;
  options?: CompressionJobOptions;
}

/** In-process async compression queue (D55-01 — LLM summarizer off hot path). */
export class LocalCompressionScheduler implements ICompressionScheduler {
  private readonly queue: PendingCompressionJob[] = [];

  constructor(private readonly runner: CompressionJobRunner) {}

  async enqueue(scope: MemoryScope, options?: CompressionJobOptions): Promise<string> {
    const jobId = crypto.randomUUID();
    this.queue.push({ id: jobId, scope, options });
    return jobId;
  }

  async runPending(limit: number): Promise<CompressionJobReport> {
    const batch = this.queue.splice(0, Math.max(0, limit));
    const aggregate: CompressionJobReport = {
      candidates: 0,
      compressed: 0,
      dryRun: true,
    };

    for (const job of batch) {
      const report = await this.runner.run(job.scope, job.options);
      aggregate.candidates += report.candidates;
      aggregate.compressed += report.compressed;
      aggregate.dryRun = aggregate.dryRun && report.dryRun;
    }

    return aggregate;
  }

  pendingCount(): number {
    return this.queue.length;
  }
}
