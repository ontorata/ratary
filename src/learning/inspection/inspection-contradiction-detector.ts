import type {
  InspectionPattern,
  InspectionPatternContradiction,
} from './inspection-pattern.types.js';

function pathsOverlap(a: InspectionPattern, b: InspectionPattern): boolean {
  const pathsA = a.trigger.paths ?? [];
  const pathsB = b.trigger.paths ?? [];
  if (pathsA.length === 0 || pathsB.length === 0) {
    return false;
  }
  return pathsA.some((pathA) =>
    pathsB.some((pathB) => pathA.startsWith(pathB) || pathB.startsWith(pathA)),
  );
}

/** Deterministic contradiction: overlapping path scope with different high-risk categories. */
export function detectInspectionContradictions(
  ownerId: string,
  patterns: readonly InspectionPattern[],
  nowIso: string,
): InspectionPatternContradiction[] {
  const active = patterns.filter(
    (pattern) => !pattern.disabled && pattern.lifecycleState !== 'archived',
  );
  const contradictions: InspectionPatternContradiction[] = [];

  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const left = active[i]!;
      const right = active[j]!;
      if (left.category === right.category) {
        continue;
      }
      if (!pathsOverlap(left, right)) {
        continue;
      }
      contradictions.push({
        id: crypto.randomUUID(),
        ownerId,
        patternIdA: left.id,
        patternIdB: right.id,
        reason: `Shared scope with conflicting categories ${left.category} vs ${right.category}`,
        detectedAt: nowIso,
      });
    }
  }

  return contradictions;
}
