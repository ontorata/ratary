import type { IMemoryRepository } from '../repositories/memory.repository.interface.js';
import type { MemoryRelationRepository } from '../repositories/memory-relation.repository.js';
import type { MemoryScope } from '../types/memory-scope.js';
import type { Memory } from '../types/memory.js';
import { generateSummary } from '../knowledge/summary.generator.js';
import { slugify } from '../knowledge/slug.generator.js';
import { resolveCodenamePrefix } from '../knowledge/codename.generator.js';
import { computeSemanticHash, normalizeTitleForDedup } from './semantic-hash.js';
import type { ICompressionPolicy } from './compression/compression-policy.interface.js';
import type { CompressionMetadata } from './compression/compression.types.js';
import { MANIFEST_MAX_MEMORY_CONTENT_BYTES } from '../capabilities/capability-manifest.constants.js';

export interface ConsolidationOptions {
  dryRun?: boolean;
  projectId?: string;
  generateSummary?: boolean;
  staleAccessMin?: number;
  staleDays?: number;
  importanceBump?: number;
}

export interface ConsolidationDeps {
  compressionPolicy?: ICompressionPolicy;
  compressionEnabled?: boolean;
}

export interface ConsolidationAction {
  type: 'archive_duplicate' | 'create_summary' | 'promote_stale' | 'link_duplicate';
  memoryId: string;
  details: string;
}

export interface ConsolidationReport {
  duplicatesFound: number;
  duplicatesArchived: number;
  stalePromoted: number;
  summariesCreated: number;
  relationsCreated: number;
  dryRun: boolean;
  actions: ConsolidationAction[];
}

const DEFAULT_STALE_ACCESS_MIN = 3;
const DEFAULT_STALE_DAYS = 30;
const DEFAULT_IMPORTANCE_BUMP = 5;

export class MemoryConsolidator {
  private readonly compressionPolicy?: ICompressionPolicy;
  private readonly compressionEnabled: boolean;

  constructor(
    private readonly repository: IMemoryRepository,
    private readonly relationRepository?: MemoryRelationRepository,
    deps: ConsolidationDeps = {},
  ) {
    this.compressionPolicy = deps.compressionPolicy;
    this.compressionEnabled = deps.compressionEnabled ?? false;
  }

  async run(scope: MemoryScope, options: ConsolidationOptions = {}): Promise<ConsolidationReport> {
    const dryRun = options.dryRun ?? true;
    const report: ConsolidationReport = {
      duplicatesFound: 0,
      duplicatesArchived: 0,
      stalePromoted: 0,
      summariesCreated: 0,
      relationsCreated: 0,
      dryRun,
      actions: [],
    };

    const memories = await this.loadActiveMemories(scope.ownerId, options.projectId);
    const duplicateGroups = this.findDuplicateGroups(memories);

    report.duplicatesFound = duplicateGroups.reduce((sum, group) => sum + group.length, 0);

    for (const group of duplicateGroups) {
      if (group.length < 2) continue;

      const canonical = this.pickCanonical(group);
      const others = group.filter((m) => m.id !== canonical.id);
      let targetId = canonical.id;
      const sourceIds = group.map((m) => m.id);

      const shouldSummarize =
        options.generateSummary &&
        (!this.compressionEnabled ||
          !this.compressionPolicy ||
          this.compressionPolicy.shouldCompress(
            {
              memory: canonical,
              duplicateClusterSize: group.length,
              totalChars: group.reduce((sum, m) => sum + m.content.length, 0),
            },
            {
              scope,
              deploymentLimits: { maxMemoryContentBytes: MANIFEST_MAX_MEMORY_CONTENT_BYTES },
            },
          ));

      if (shouldSummarize) {
        report.actions.push({
          type: 'create_summary',
          memoryId: canonical.id,
          details: `Create summary from ${group.length} memories`,
        });

        if (!dryRun) {
          const summaryContent = group
            .map((m) => `${m.title}: ${m.summary || generateSummary(m.content)}`)
            .join('\n\n');
          const summaryTitle = `Summary: ${canonical.title}`;
          const targetLevel =
            this.compressionPolicy?.targetLevel({
              memory: canonical,
              duplicateClusterSize: group.length,
            }) ?? 'summary';

          const codename = await this.repository.allocateCodename(
            scope.ownerId,
            resolveCodenamePrefix({
              memoryType: 'note',
              category: canonical.category,
              project: canonical.project,
            }),
          );
          const summaryMemory = await this.repository.insert({
            title: summaryTitle,
            project: canonical.project,
            content: summaryContent,
            summary: generateSummary(summaryContent),
            tags: canonical.tags,
            keywords: canonical.keywords,
            category: canonical.category,
            memoryType: 'note',
            importance: Math.min(100, canonical.importance + 5),
            language: canonical.language,
            notes: `Consolidated from ${canonical.codename}`,
            codename,
            slug: slugify(summaryTitle),
            favorite: false,
            ownerId: scope.ownerId,
            projectId: canonical.projectId,
            level: targetLevel,
            semanticHash: computeSemanticHash(
              summaryTitle,
              generateSummary(summaryContent),
              summaryContent,
            ),
          });
          targetId = summaryMemory.id;
          report.summariesCreated++;

          if (this.compressionEnabled && this.compressionPolicy) {
            const charsBefore = group.reduce((sum, m) => sum + m.content.length, 0);
            const meta: CompressionMetadata = {
              algorithm: this.compressionPolicy.algorithmId(),
              version: this.compressionPolicy.policyVersion(),
              sourceMemoryIds: sourceIds,
              charRatio: summaryContent.length / Math.max(charsBefore, 1),
              compressedAt: new Date().toISOString(),
            };
            await this.repository.applyCompressionMetadata(
              summaryMemory.id,
              scope.ownerId,
              meta as unknown as Record<string, unknown>,
              this.compressionPolicy.policyVersion(),
            );
            for (const sourceId of sourceIds) {
              await this.linkConsolidates(scope.ownerId, targetId, sourceId, report);
            }
          }
        }
      }

      for (const dup of others) {
        report.actions.push({
          type: 'archive_duplicate',
          memoryId: dup.id,
          details: `Archive duplicate of ${canonical.codename}`,
        });
        report.actions.push({
          type: 'link_duplicate',
          memoryId: dup.id,
          details: `Link duplicate → ${targetId}`,
        });

        if (!dryRun) {
          await this.repository.archive(dup.id, scope.ownerId, true);
          report.duplicatesArchived++;
          await this.linkDuplicate(scope.ownerId, dup.id, targetId, report);
        }
      }
    }

    const staleCandidates = await this.repository.findStaleCandidates({
      ownerId: scope.ownerId,
      projectId: options.projectId,
      minAccessCount: options.staleAccessMin ?? DEFAULT_STALE_ACCESS_MIN,
      olderThanDays: options.staleDays ?? DEFAULT_STALE_DAYS,
    });

    const bump = options.importanceBump ?? DEFAULT_IMPORTANCE_BUMP;
    for (const memory of staleCandidates) {
      const nextImportance = Math.min(100, memory.importance + bump);
      if (nextImportance === memory.importance) continue;

      report.actions.push({
        type: 'promote_stale',
        memoryId: memory.id,
        details: `Importance ${memory.importance} → ${nextImportance}`,
      });

      if (!dryRun) {
        await this.repository.bumpImportance(memory.id, scope.ownerId, nextImportance);
        report.stalePromoted++;
      }
    }

    return report;
  }

  private async loadActiveMemories(ownerId: string, projectId?: string): Promise<Memory[]> {
    const all = await this.repository.findAllByOwner(ownerId);
    return all.filter(
      (m) =>
        !m.archived &&
        (!projectId || m.projectId === projectId) &&
        (m.level === 'raw' || m.level === 'note'),
    );
  }

  private findDuplicateGroups(memories: Memory[]): Memory[][] {
    const byHash = new Map<string, Memory[]>();
    const byTitle = new Map<string, Memory[]>();

    for (const memory of memories) {
      const hash =
        memory.semanticHash ?? computeSemanticHash(memory.title, memory.summary, memory.content);
      const hashGroup = byHash.get(hash) ?? [];
      hashGroup.push(memory);
      byHash.set(hash, hashGroup);

      const titleKey = `${memory.projectId}::${normalizeTitleForDedup(memory.title)}`;
      const titleGroup = byTitle.get(titleKey) ?? [];
      titleGroup.push(memory);
      byTitle.set(titleKey, titleGroup);
    }

    const groups: Memory[][] = [];
    const seen = new Set<string>();

    for (const group of [...byHash.values(), ...byTitle.values()]) {
      if (group.length < 2) continue;
      const key = [...group.map((m) => m.id)].sort().join(',');
      if (seen.has(key)) continue;
      seen.add(key);
      groups.push(group);
    }

    return groups;
  }

  private pickCanonical(group: Memory[]): Memory {
    return [...group].sort((a, b) => {
      if (b.importance !== a.importance) return b.importance - a.importance;
      return b.updatedAt.localeCompare(a.updatedAt);
    })[0];
  }

  private async linkDuplicate(
    ownerId: string,
    sourceId: string,
    targetId: string,
    report: ConsolidationReport,
  ): Promise<void> {
    if (!this.relationRepository) return;

    const exists = await this.relationRepository.exists(sourceId, targetId, 'duplicate', ownerId);
    if (exists) return;

    await this.relationRepository.createFromInput(sourceId, ownerId, {
      targetMemoryId: targetId,
      relation: 'duplicate',
      sourceType: 'inferred',
      confidence: 0.9,
    });
    report.relationsCreated++;
  }

  private async linkConsolidates(
    ownerId: string,
    summaryId: string,
    sourceId: string,
    report: ConsolidationReport,
  ): Promise<void> {
    if (!this.relationRepository) return;

    const exists = await this.relationRepository.exists(
      summaryId,
      sourceId,
      'consolidates',
      ownerId,
    );
    if (exists) return;

    await this.relationRepository.createFromInput(summaryId, ownerId, {
      targetMemoryId: sourceId,
      relation: 'consolidates',
      sourceType: 'inferred',
      confidence: 1,
    });
    report.relationsCreated++;
  }
}
