import type { MemoryQualitySignal } from './memory-quality-signal.types.js';

export interface MemorySnapshot {
  id: string;
  importance: number;
}

/** Pure — returns bounded delta, no I/O */
export class ImportanceScoringPolicy {
  score(signal: MemoryQualitySignal, _memory: MemorySnapshot): number {
    if (signal.deltaImportance !== undefined) {
      return clampDelta(signal.deltaImportance);
    }

    if (signal.signalType === 'explicit_feedback') {
      const value = signal.payload?.value;
      if (value === 'helpful') return 5;
      if (value === 'not_helpful') return -5;
    }

    if (signal.signalType === 'consolidation_hint' || signal.signalType === 'inspection_outcome') {
      return 0;
    }

    return 0;
  }

  applyDelta(currentImportance: number, delta: number): number {
    return Math.min(100, Math.max(0, currentImportance + delta));
  }
}

function clampDelta(delta: number): number {
  return Math.min(10, Math.max(-10, delta));
}
