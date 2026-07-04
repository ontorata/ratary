import { z } from 'zod';
import type { ISignalNormalizer, SignalAuthContext } from './isignal-normalizer.interface.js';
import type { MemoryQualitySignal } from './memory-quality-signal.types.js';

const explicitFeedbackSchema = z.object({
  type: z.literal('explicit_feedback'),
  memoryId: z.string().uuid(),
  value: z.enum(['helpful', 'not_helpful']),
  signalId: z.string().uuid().optional(),
});

export class DefaultSignalNormalizer implements ISignalNormalizer {
  normalize(raw: unknown, ctx: SignalAuthContext): MemoryQualitySignal | null {
    const parsed = explicitFeedbackSchema.safeParse(raw);
    if (!parsed.success) {
      return null;
    }

    const data = parsed.data;
    return {
      signalId: data.signalId ?? crypto.randomUUID(),
      signalType: 'explicit_feedback',
      memoryId: data.memoryId,
      ownerId: ctx.ownerId,
      workspaceId: ctx.workspaceId,
      payload: { value: data.value },
      observedAt: new Date().toISOString(),
    };
  }
}
