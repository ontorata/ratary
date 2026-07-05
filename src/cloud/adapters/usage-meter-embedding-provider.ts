import type { IUsageMeter } from '../../cloud/ports/iusage-meter.port.js';
import type {
  EmbeddingInput,
  EmbeddingResult,
  IEmbeddingProvider,
} from '../../embedding/embedding.provider.interface.js';

/** Records `embedding.request` usage for each embed batch (Phase 18 → 19 bridge, D19-01). */
export class UsageMeterEmbeddingProvider implements IEmbeddingProvider {
  constructor(
    private readonly inner: IEmbeddingProvider,
    private readonly usageMeter: IUsageMeter,
  ) {}

  get modelId(): string {
    return this.inner.modelId;
  }

  get dimensions(): number {
    return this.inner.dimensions;
  }

  async embed(inputs: EmbeddingInput[]): Promise<EmbeddingResult[]> {
    const results = await this.inner.embed(inputs);
    const occurredAt = new Date().toISOString();

    for (const input of inputs) {
      if (!input.ownerId) continue;
      await this.usageMeter.recordUsage({
        ownerId: input.ownerId,
        workspaceId: input.workspaceId,
        metricType: 'embedding.request',
        quantity: 1,
        occurredAt,
        metadata: { memoryId: input.memoryId },
      });
    }

    return results;
  }
}
