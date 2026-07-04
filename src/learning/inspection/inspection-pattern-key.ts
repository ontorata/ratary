import { createHash } from 'node:crypto';
import type { InspectionDiffScope } from '../../ingest/memory-quality-signal.types.js';
import type { InspectionOutcomeCategory } from '../../ingest/memory-quality-signal.types.js';
import type { InspectionPatternTrigger } from './inspection-pattern.types.js';

function normalizeTrigger(scope?: InspectionDiffScope | InspectionPatternTrigger): InspectionPatternTrigger {
  if (!scope) {
    return {};
  }
  return {
    paths: scope.paths ? [...scope.paths].sort() : undefined,
    modules: scope.modules ? [...scope.modules].sort() : undefined,
    adrIds: scope.adrIds ? [...scope.adrIds].sort() : undefined,
  };
}

export function hashInspectionTrigger(trigger: InspectionPatternTrigger): string {
  const normalized = normalizeTrigger(trigger);
  return createHash('sha256').update(JSON.stringify(normalized)).digest('hex').slice(0, 16);
}

export function buildInspectionPatternKey(
  category: InspectionOutcomeCategory,
  trigger: InspectionPatternTrigger,
): string {
  return `${category}:${hashInspectionTrigger(trigger)}`;
}

export function buildInspectionPatternDescription(
  category: InspectionOutcomeCategory,
  trigger: InspectionPatternTrigger,
  evidenceCount: number,
): string {
  const scope =
    trigger.paths?.join(', ') ||
    trigger.modules?.join(', ') ||
    trigger.adrIds?.join(', ') ||
    'general scope';
  return `Inspection pattern (${category}): ${evidenceCount} confirmed outcomes in ${scope}`;
}
