import type { IMemoryRepository } from '../repositories/memory.repository.interface.js';
import type { MemoryScope } from '../types/memory-scope.js';
import type { ICompressionSummarizer } from '../memory/compression/compression-summarizer.interface.js';

export interface SummaryEnrichmentOptions {
  dryRun?: boolean;
  projectId?: string;
  limit?: number;
}

export interface SummaryEnrichmentReport {
  scanned: number;
  enriched: number;
  dryRun: boolean;
  algorithmId: string;
}

/**
 * Batch async summary refresh — mitigates Phase 2.6 rule-based variance without CRUD hot-path LLM.
 */
export class SummaryEnrichmentRunner {
  constructor(
    private readonly repository: IMemoryRepository,
    private readonly summarizer: ICompressionSummarizer,
  ) {}

  async run(
    scope: MemoryScope,
    options: SummaryEnrichmentOptions = {},
  ): Promise<SummaryEnrichmentReport> {
    const dryRun = options.dryRun ?? true;
    const limit = options.limit ?? 500;
    const report: SummaryEnrichmentReport = {
      scanned: 0,
      enriched: 0,
      dryRun,
      algorithmId: this.summarizer.algorithmId,
    };

    const memories = (await this.repository.findAllByOwner(scope.ownerId))
      .filter(
        (m) =>
          !m.archived &&
          m.content.length > 0 &&
          (!options.projectId || m.projectId === options.projectId),
      )
      .slice(0, limit);

    for (const memory of memories) {
      report.scanned++;
      const nextSummary = await this.summarizer.summarize(memory.content, {
        title: memory.title,
        project: memory.project,
      });

      if (nextSummary === memory.summary) {
        continue;
      }

      if (!dryRun) {
        await this.repository.update(memory.id, scope.ownerId, { summary: nextSummary });
      }
      report.enriched++;
    }

    return report;
  }
}
