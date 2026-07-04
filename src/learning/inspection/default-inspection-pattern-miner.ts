import type { LearningEvent } from '../learning.types.js';
import type { MemoryScope } from '../../types/memory-scope.js';
import type { InspectionPatternCandidate } from './inspection-pattern.types.js';
import type { InspectionDiffScope } from '../../ingest/memory-quality-signal.types.js';
import type { InspectionOutcomeCategory } from '../../ingest/memory-quality-signal.types.js';
import {
  INSPECTION_MAJOR_SEVERITIES,
  INSPECTION_MIN_EVIDENCE_COUNT,
} from './inspection-ledger.constants.js';
import {
  buildInspectionPatternDescription,
  buildInspectionPatternKey,
} from './inspection-pattern-key.js';

function parseTrigger(payload: Record<string, unknown>): InspectionDiffScope | undefined {
  const raw = payload.diffScope;
  if (!raw || typeof raw !== 'object') {
    return undefined;
  }
  const scope = raw as InspectionDiffScope;
  return {
    paths: scope.paths,
    modules: scope.modules,
    adrIds: scope.adrIds,
  };
}

function isEligibleInspectionEvent(event: LearningEvent): boolean {
  if (event.eventType !== 'signal.inspection_outcome') {
    return false;
  }
  if (event.payload.resolved !== true) {
    return false;
  }
  const severity = event.payload.severity;
  return (
    typeof severity === 'string' &&
    (INSPECTION_MAJOR_SEVERITIES as readonly string[]).includes(severity)
  );
}

export class DefaultInspectionPatternMiner {
  mine(scope: MemoryScope, events: readonly LearningEvent[]): InspectionPatternCandidate[] {
    const buckets = new Map<
      string,
      {
        category: InspectionOutcomeCategory;
        trigger: InspectionDiffScope;
        signalIds: string[];
      }
    >();

    for (const event of events) {
      if (!isEligibleInspectionEvent(event)) {
        continue;
      }
      const category = event.payload.category as InspectionOutcomeCategory;
      const trigger = parseTrigger(event.payload) ?? {};
      const patternKey = buildInspectionPatternKey(category, trigger);
      const bucket = buckets.get(patternKey) ?? { category, trigger, signalIds: [] };
      const signalId =
        typeof event.payload.signalId === 'string' ? event.payload.signalId : event.id;
      bucket.signalIds.push(signalId);
      buckets.set(patternKey, bucket);
    }

    const candidates: InspectionPatternCandidate[] = [];
    for (const [patternKey, bucket] of buckets.entries()) {
      if (bucket.signalIds.length < INSPECTION_MIN_EVIDENCE_COUNT) {
        continue;
      }
      candidates.push({
        patternKey,
        category: bucket.category,
        trigger: bucket.trigger,
        description: buildInspectionPatternDescription(
          bucket.category,
          bucket.trigger,
          bucket.signalIds.length,
        ),
        evidenceCount: bucket.signalIds.length,
        signalIds: bucket.signalIds,
      });
    }

    void scope.ownerId;
    return candidates;
  }
}
