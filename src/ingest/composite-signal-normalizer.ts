import type { ISignalNormalizer, SignalAuthContext } from './isignal-normalizer.interface.js';
import type { MemoryQualitySignal } from './memory-quality-signal.types.js';

/** Tries child normalizers in order; returns first match. */
export class CompositeSignalNormalizer implements ISignalNormalizer {
  constructor(private readonly normalizers: readonly ISignalNormalizer[]) {}

  normalize(raw: unknown, ctx: SignalAuthContext): MemoryQualitySignal | null {
    for (const normalizer of this.normalizers) {
      const signal = normalizer.normalize(raw, ctx);
      if (signal) {
        return signal;
      }
    }
    return null;
  }
}
