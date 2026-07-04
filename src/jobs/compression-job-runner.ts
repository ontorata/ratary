import type { IMemoryRepository } from '../repositories/memory.repository.interface.js';
import type { MemoryRelationRepository } from '../repositories/memory-relation.repository.js';
import type { MemoryScope } from '../types/memory-scope.js';
import { MemoryConsolidator } from '../memory/consolidator.js';
import type { ICompressionPolicy } from '../memory/compression/compression-policy.interface.js';
import type {
  CompressionJobOptions,
  CompressionJobReport,
} from '../memory/compression/compression.types.js';

export class CompressionJobRunner {
  constructor(
    private readonly repository: IMemoryRepository,
    private readonly relationRepository: MemoryRelationRepository,
    private readonly policy: ICompressionPolicy,
    private readonly enabled: boolean,
  ) {}

  async run(
    scope: MemoryScope,
    options: CompressionJobOptions = {},
  ): Promise<CompressionJobReport> {
    const dryRun = options.dryRun ?? true;
    const report: CompressionJobReport = {
      candidates: 0,
      compressed: 0,
      dryRun,
    };

    if (!this.enabled) {
      return report;
    }

    const consolidator = new MemoryConsolidator(this.repository, this.relationRepository, {
      compressionPolicy: this.policy,
      compressionEnabled: true,
    });

    const consolidation = await consolidator.run(scope, {
      dryRun,
      projectId: options.projectId,
      generateSummary: !dryRun,
    });

    report.candidates = consolidation.duplicatesFound;
    report.compressed = consolidation.summariesCreated;
    return report;
  }
}
