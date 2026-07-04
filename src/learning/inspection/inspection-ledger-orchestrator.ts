import type { ILearningEventStore } from '../ilearning-event-store.port.js';
import type { IMemoryRepository } from '../../repositories/memory.repository.interface.js';
import type { IInspectionPatternStore } from './iinspection-pattern-store.interface.js';
import type { IInspectionLedgerOrchestrator } from './iinspection-ledger-orchestrator.interface.js';
import type {
  InspectionLedgerRunOptions,
  InspectionLedgerRunReport,
  InspectionPattern,
} from './inspection-pattern.types.js';
import type { MemoryScope } from '../../types/memory-scope.js';
import { DefaultInspectionPatternMiner } from './default-inspection-pattern-miner.js';
import { DefaultInspectionConfidencePolicy } from './default-inspection-confidence-policy.js';
import { detectInspectionContradictions } from './inspection-contradiction-detector.js';
import { CharterPatternPromoter } from './charter-pattern-promoter.js';
import type { Env } from '../../config/env.js';

export interface InspectionLedgerOrchestratorDeps {
  eventStore: ILearningEventStore;
  patternStore: IInspectionPatternStore;
  memoryRepository: IMemoryRepository;
  env: Env;
}

export class InspectionLedgerOrchestrator implements IInspectionLedgerOrchestrator {
  private readonly miner = new DefaultInspectionPatternMiner();
  private readonly confidence = new DefaultInspectionConfidencePolicy();
  private readonly charterPromoter: CharterPatternPromoter;

  constructor(private readonly deps: InspectionLedgerOrchestratorDeps) {
    this.charterPromoter = new CharterPatternPromoter(deps.patternStore, deps.env);
  }

  async run(scope: MemoryScope, options: InspectionLedgerRunOptions): Promise<InspectionLedgerRunReport> {
    const now = new Date().toISOString();
    const limit = options.limit ?? 500;
    const events = await this.deps.eventStore.listUnprocessed(scope, limit);
    const inspectionEvents = events.filter((event) => event.eventType === 'signal.inspection_outcome');

    const candidates = this.miner.mine(scope, inspectionEvents);
    let patternsUpserted = 0;

    for (const candidate of candidates) {
      patternsUpserted++;
      if (options.dryRun) {
        continue;
      }

      const existing = await this.deps.patternStore.findByPatternKey(
        scope,
        candidate.patternKey,
        'workspace',
      );
      const patternId = existing?.id ?? crypto.randomUUID();
      const memoryId =
        existing?.memoryId ??
        (await this.ensureRecallMemory(scope, candidate.description, candidate.category, now));

      const pattern: InspectionPattern = {
        id: patternId,
        ownerId: scope.ownerId,
        workspaceId: scope.workspaceId,
        memoryId,
        patternKey: candidate.patternKey,
        patternScope: 'workspace',
        category: candidate.category,
        trigger: candidate.trigger,
        description: candidate.description,
        confidence: this.confidence.confidenceForEvidence(candidate.evidenceCount),
        evidenceCount: candidate.evidenceCount,
        protected: existing?.protected ?? false,
        disabled: existing?.disabled ?? false,
        lifecycleState: 'active',
        lastConfirmedAt: now,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };

      await this.deps.patternStore.upsert(pattern);
      for (const signalId of candidate.signalIds) {
        await this.deps.patternStore.appendEventLink(patternId, signalId, now);
      }
    }

    const allPatterns = await this.deps.patternStore.list(scope, { includeArchived: true });
    let confidenceRefreshed = 0;
    if (!options.dryRun) {
      for (const pattern of allPatterns) {
        const refreshed = this.confidence.refresh(pattern, now);
        if (
          refreshed.confidence !== pattern.confidence ||
          refreshed.lifecycleState !== pattern.lifecycleState
        ) {
          confidenceRefreshed++;
          await this.deps.patternStore.updateLifecycle(pattern.id, {
            confidence: refreshed.confidence,
            lifecycleState: refreshed.lifecycleState,
            lastConfirmedAt: refreshed.lastConfirmedAt,
            updatedAt: refreshed.updatedAt,
          });
        }
      }
    }

    const contradictions = detectInspectionContradictions(scope.ownerId, allPatterns, now);
    if (!options.dryRun) {
      for (const contradiction of contradictions) {
        await this.deps.patternStore.recordContradiction(contradiction);
      }
    }

    const charterPromoted = await this.charterPromoter.promote(
      scope,
      allPatterns,
      options.dryRun,
    );

    if (!options.dryRun && inspectionEvents.length > 0) {
      await this.deps.eventStore.markProcessed(inspectionEvents.map((event) => event.id));
    }

    return {
      ownerId: scope.ownerId,
      workspaceId: scope.workspaceId,
      dryRun: options.dryRun,
      eventsScanned: inspectionEvents.length,
      patternsUpserted,
      contradictionsFound: contradictions.length,
      charterPromoted,
      confidenceRefreshed,
    };
  }

  private async ensureRecallMemory(
    scope: MemoryScope,
    description: string,
    category: string,
    now: string,
  ): Promise<string | undefined> {
    try {
      const slugBase = `inspection-${category}-${now.slice(0, 10)}`;
      let slug = slugBase;
      let suffix = 1;
      while (await this.deps.memoryRepository.slugExists(scope.ownerId, slug)) {
        slug = `${slugBase}-${suffix++}`;
      }
      const codename = await this.deps.memoryRepository.allocateCodename(scope.ownerId, 'ARCH');
      const memory = await this.deps.memoryRepository.insert({
        title: description.slice(0, 120),
        project: 'ai-brain',
        content: `# Inspection Pattern\n\n${description}\n\n_Auto-generated by Phase 8.8 ledger miner._`,
        summary: description.slice(0, 200),
        tags: ['inspection-pattern', category],
        keywords: ['inspection-pattern', category],
        category: 'Architecture',
        memoryType: 'architecture',
        importance: 60,
        language: 'en',
        notes: '',
        favorite: false,
        ownerId: scope.ownerId,
        workspaceId: scope.workspaceId,
        slug,
        codename,
      });
      return memory.id;
    } catch {
      return undefined;
    }
  }
}
