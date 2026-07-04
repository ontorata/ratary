import type { MemoryScope } from '../types/memory-scope.js';
import type {
  CompressionJobOptions,
  CompressionJobReport,
} from '../memory/compression/compression.types.js';
import type { ICompressionScheduler } from '../ports/compression/icompression-scheduler.port.js';
import { CompressionJobRunner } from '../jobs/compression-job-runner.js';

export class LocalCompressionScheduler implements ICompressionScheduler {
  constructor(private readonly runner: CompressionJobRunner) {}

  async enqueue(scope: MemoryScope, options?: CompressionJobOptions): Promise<string> {
    const jobId = crypto.randomUUID();
    await this.runner.run(scope, options);
    return jobId;
  }

  async runPending(_limit: number): Promise<CompressionJobReport> {
    return { candidates: 0, compressed: 0, dryRun: true };
  }
}
