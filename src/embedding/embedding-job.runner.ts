import type { IMemoryReader, IMemoryWriter } from '../repositories/memory.repository.interface.js';
import type { Memory } from '../types/memory.js';
import { buildEmbedText, computeEmbedContentHash } from './embed-text.js';
import type { IEmbeddingProvider } from './embedding.provider.interface.js';
import type { IEmbeddingStore } from './embedding.store.interface.js';

export interface EmbeddingJobOptions {
  ownerId: string;
  projectId?: string;
  batchSize?: number;
  dryRun?: boolean;
  forceReembed?: boolean;
  maxMemories?: number;
}

export interface EmbeddingJobReport {
  scanned: number;
  embedded: number;
  skipped: number;
  failed: number;
  dryRun: boolean;
}

const DEFAULT_BATCH_SIZE = 32;
const DEFAULT_MAX_MEMORIES = 10_000;

function matchesProject(memory: Memory, projectId?: string): boolean {
  if (!projectId) {
    return true;
  }
  return memory.projectId === projectId || memory.project === projectId;
}

export class EmbeddingJobRunner {
  constructor(
    private readonly reader: IMemoryReader,
    private readonly writer: IMemoryWriter,
    private readonly provider: IEmbeddingProvider,
    private readonly store: IEmbeddingStore,
  ) {}

  async run(options: EmbeddingJobOptions): Promise<EmbeddingJobReport> {
    const batchSize = options.batchSize ?? DEFAULT_BATCH_SIZE;
    const dryRun = options.dryRun ?? true;
    const maxMemories = options.maxMemories ?? DEFAULT_MAX_MEMORIES;
    const forceReembed = options.forceReembed ?? false;

    const report: EmbeddingJobReport = {
      scanned: 0,
      embedded: 0,
      skipped: 0,
      failed: 0,
      dryRun,
    };

    const seen = new Set<string>();
    let forceOffset = 0;

    while (report.scanned < maxMemories) {
      const remaining = maxMemories - report.scanned;
      const limit = Math.min(batchSize, remaining);

      let memories = forceReembed
        ? await this.fetchForceBatch(options.ownerId, forceOffset, limit)
        : await this.reader.findWithoutEmbedding(options.ownerId, limit);

      if (options.projectId) {
        memories = memories.filter((memory) => matchesProject(memory, options.projectId));
      }

      if (dryRun) {
        memories = memories.filter((memory) => !seen.has(memory.id));
      }

      if (memories.length === 0) {
        break;
      }

      if (forceReembed) {
        forceOffset += memories.length;
      }

      for (const memory of memories) {
        if (dryRun) {
          seen.add(memory.id);
        }
        report.scanned++;

        const contentHash = computeEmbedContentHash(memory.title, memory.summary, memory.content);
        const existing = await this.store.findByMemoryId(
          memory.id,
          options.ownerId,
          this.provider.modelId,
        );

        if (existing && existing.contentHash === contentHash && !forceReembed) {
          report.skipped++;
          if (!dryRun && !memory.embeddingId) {
            await this.writer.applyEmbeddingBackfill(memory.id, options.ownerId, {
              embeddingId: existing.id,
            });
          }
          continue;
        }

        if (dryRun) {
          report.embedded++;
          continue;
        }

        try {
          await this.embedMemory(memory, contentHash, options.ownerId);
          report.embedded++;
        } catch {
          report.failed++;
        }
      }
    }

    return report;
  }

  private async fetchForceBatch(ownerId: string, offset: number, limit: number): Promise<Memory[]> {
    const all = await this.reader.findAllByOwner(ownerId);
    return all.slice(offset, offset + limit);
  }

  private async embedMemory(memory: Memory, contentHash: string, ownerId: string): Promise<void> {
    const [result] = await this.provider.embed([
      {
        memoryId: memory.id,
        text: buildEmbedText(memory.title, memory.summary, memory.content),
        ownerId,
      },
    ]);

    if (!result) {
      throw new Error(`Embedding provider returned no result for memory ${memory.id}`);
    }

    const embeddingId = await this.store.upsert({
      memoryId: memory.id,
      ownerId,
      modelId: result.modelId,
      dimensions: result.dimensions,
      vector: result.vector,
      contentHash,
    });

    await this.writer.applyEmbeddingBackfill(memory.id, ownerId, { embeddingId });
  }
}
