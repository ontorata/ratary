import type { ExternalKnowledgeItem } from '../types/connector.types.js';
import type {
  IFabricNormalizer,
  FabricNormalizeContext,
} from '../ports/ifabric-normalizer.port.js';
import type { NormalizedFabricMemory } from '../types/ingest.types.js';

/** Default normalizer — provenance in tags and notes (Phase 23). */
export class DefaultFabricNormalizer implements IFabricNormalizer {
  normalize(
    item: ExternalKnowledgeItem,
    ctx: FabricNormalizeContext,
  ): NormalizedFabricMemory | null {
    const title = item.title.trim();
    const content = item.body.trim();
    if (!title || !content) return null;

    const provenance = {
      connectorId: ctx.connectorId,
      externalId: item.externalId,
      externalUrl: item.externalUrl,
      externalUpdatedAt: item.updatedAt,
      ...item.metadata,
    };

    return {
      title,
      content,
      summary: item.summary?.trim() ?? title.slice(0, 200),
      project: String(item.metadata.project ?? 'knowledge-fabric'),
      tags: [
        `fabric:${ctx.connectorId}`,
        `fabric-ref:${item.externalId}`,
        ...(Array.isArray(item.metadata.tags) ? (item.metadata.tags as string[]) : []),
      ],
      notes: JSON.stringify({ fabricProvenance: provenance }),
    };
  }
}
