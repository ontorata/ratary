import type { Env } from '../config/env.js';
import type { ISqlDatabase } from '../ports/sql/isql-database.port.js';
import { MemoryRepository } from '../repositories/memory.repository.js';
import { MemoryRelationRepository } from '../repositories/memory-relation.repository.js';
import { CompressionJobRunner } from '../jobs/compression-job-runner.js';
import { LocalCompressionScheduler } from '../jobs/local-compression-scheduler.js';
import { RuleBasedCompressionPolicy } from '../memory/compression/rule-based-compression-policy.js';
import type { ICompressionPolicy } from '../memory/compression/compression-policy.interface.js';
import type { ICompressionSummarizer } from '../memory/compression/compression-summarizer.interface.js';
import type { ICompressionScheduler } from '../ports/compression/icompression-scheduler.port.js';
import { createCompressionSummarizer } from './create-compression-summarizer.js';

export interface CompressionPorts {
  enabled: boolean;
  policy: ICompressionPolicy;
  runner: CompressionJobRunner;
  scheduler?: ICompressionScheduler;
  summarizer: ICompressionSummarizer;
}

/**
 * Composition root for Phase 5.5 semantic compression (ADR-023).
 * Wires rule-based policy and job runner; gated by COMPRESSION_ENABLED.
 */
export function createCompressionPorts(sql: ISqlDatabase, env: Env): CompressionPorts {
  const repository = new MemoryRepository(sql);
  const relationRepository = new MemoryRelationRepository(sql);
  const policy = new RuleBasedCompressionPolicy();
  const summarizer = createCompressionSummarizer(env);
  const runner = new CompressionJobRunner(
    repository,
    relationRepository,
    policy,
    env.COMPRESSION_ENABLED,
    summarizer,
  );
  const scheduler =
    env.COMPRESSION_SCHEDULER === 'local' ? new LocalCompressionScheduler(runner) : undefined;

  return { enabled: env.COMPRESSION_ENABLED, policy, runner, scheduler, summarizer };
}
