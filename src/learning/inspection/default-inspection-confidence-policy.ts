import type { InspectionPattern, InspectionPatternLifecycle } from './inspection-pattern.types.js';
import {
  INSPECTION_AGING_DAYS,
  INSPECTION_ARCHIVE_CONFIDENCE,
  INSPECTION_BASE_CONFIDENCE,
  INSPECTION_CONFIDENCE_PER_EVIDENCE,
  INSPECTION_DECAY_POINTS,
  INSPECTION_LOW_CONFIDENCE,
  INSPECTION_MAX_CONFIDENCE,
} from './inspection-ledger.constants.js';

function daysBetween(fromIso: string, toIso: string): number {
  const from = Date.parse(fromIso);
  const to = Date.parse(toIso);
  if (Number.isNaN(from) || Number.isNaN(to)) {
    return 0;
  }
  return Math.floor((to - from) / (1000 * 60 * 60 * 24));
}

export class DefaultInspectionConfidencePolicy {
  confidenceForEvidence(evidenceCount: number): number {
    return Math.min(
      INSPECTION_MAX_CONFIDENCE,
      INSPECTION_BASE_CONFIDENCE + evidenceCount * INSPECTION_CONFIDENCE_PER_EVIDENCE,
    );
  }

  refresh(pattern: InspectionPattern, nowIso: string): InspectionPattern {
    if (pattern.protected || pattern.disabled) {
      return pattern;
    }

    let confidence = pattern.confidence;
    let lifecycleState: InspectionPatternLifecycle = pattern.lifecycleState;
    const ageDays = daysBetween(pattern.lastConfirmedAt, nowIso);

    if (ageDays >= INSPECTION_AGING_DAYS) {
      confidence = Math.max(0, confidence - INSPECTION_DECAY_POINTS);
      lifecycleState = 'aging';
    }

    if (confidence < INSPECTION_ARCHIVE_CONFIDENCE) {
      lifecycleState = 'archived';
    } else if (confidence < INSPECTION_LOW_CONFIDENCE) {
      lifecycleState = 'low';
    } else if (ageDays < INSPECTION_AGING_DAYS) {
      lifecycleState = 'active';
    }

    return {
      ...pattern,
      confidence,
      lifecycleState,
      updatedAt: nowIso,
    };
  }
}
