import type { IMemoryRepository } from '../repositories/memory.repository.interface.js';
import type { MemoryType } from '../types/knowledge.js';
import { resolveCodenamePrefix } from './codename.generator.js';
import { slugify, withSlugSuffix } from './slug.generator.js';
import { generateSummary } from './summary.generator.js';
import { normalizeKeywords } from './keyword.normalizer.js';
import { validateKnowledgeMetadata } from './metadata.validator.js';

export interface KnowledgeEnrichInput {
  title: string;
  project: string;
  content: string;
  summary?: string;
  tags: string[];
  keywords?: string[];
  category?: string;
  memoryType?: MemoryType;
  importance?: number;
  language?: string;
  notes?: string;
}

export interface EnrichedKnowledgeFields {
  codename: string;
  slug: string;
  summary: string;
  keywords: string[];
  category: string;
  memoryType: MemoryType;
  importance: number;
  language: string;
  notes: string;
}

export class KnowledgeService {
  constructor(private readonly repository: IMemoryRepository) {}

  async enrichForCreate(
    ownerId: string,
    input: KnowledgeEnrichInput,
  ): Promise<EnrichedKnowledgeFields> {
    const validated = validateKnowledgeMetadata({
      keywords: input.keywords,
      category: input.category,
      memoryType: input.memoryType,
      importance: input.importance,
      language: input.language,
      notes: input.notes,
      summary: input.summary,
    });

    const memoryType = validated.memoryType ?? 'note';
    const prefix = resolveCodenamePrefix({
      memoryType,
      category: validated.category,
      project: input.project,
    });

    const codename = await this.repository.allocateCodename(ownerId, prefix);
    const slug = await this.allocateUniqueSlug(ownerId, input.title);

    const summary =
      input.summary && input.summary.length > 0 ? input.summary : generateSummary(input.content);

    const keywords = normalizeKeywords(input.tags, validated.keywords);

    return {
      codename,
      slug,
      summary,
      keywords,
      category: validated.category ?? '',
      memoryType,
      importance: validated.importance ?? 50,
      language: validated.language ?? 'id',
      notes: validated.notes ?? '',
    };
  }

  async enrichForUpdate(
    ownerId: string,
    existing: {
      title: string;
      slug: string | null;
      summary: string;
      tags: string[];
      keywords: string[];
      category: string;
      memoryType: MemoryType;
      importance: number;
      language: string;
      notes: string;
      content: string;
    },
    input: Partial<KnowledgeEnrichInput>,
  ): Promise<Partial<EnrichedKnowledgeFields>> {
    const validated = validateKnowledgeMetadata({
      keywords: input.keywords,
      category: input.category,
      memoryType: input.memoryType,
      importance: input.importance,
      language: input.language,
      notes: input.notes,
      summary: input.summary,
    });

    const result: Partial<EnrichedKnowledgeFields> = {};

    if (input.summary !== undefined) {
      result.summary = input.summary;
    } else if (input.content !== undefined && existing.summary.length === 0) {
      result.summary = generateSummary(input.content);
    }

    if (input.tags !== undefined || input.keywords !== undefined) {
      const tags = input.tags ?? existing.tags;
      result.keywords = normalizeKeywords(tags, validated.keywords ?? input.keywords);
    }

    if (validated.category !== undefined) result.category = validated.category;
    if (validated.memoryType !== undefined) result.memoryType = validated.memoryType;
    if (validated.importance !== undefined) result.importance = validated.importance;
    if (validated.language !== undefined) result.language = validated.language;
    if (validated.notes !== undefined) result.notes = validated.notes;

    if (input.title !== undefined && input.title !== existing.title) {
      result.slug = await this.allocateUniqueSlug(ownerId, input.title, existing.slug ?? undefined);
    }

    return result;
  }

  private async allocateUniqueSlug(
    ownerId: string,
    title: string,
    excludeSlug?: string,
  ): Promise<string> {
    const base = slugify(title);
    let candidate = base;
    let suffix = 2;

    while (await this.repository.slugExists(ownerId, candidate, excludeSlug)) {
      candidate = withSlugSuffix(base, suffix);
      suffix++;
    }

    return candidate;
  }
}
