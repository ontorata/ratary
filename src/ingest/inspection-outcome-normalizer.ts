import { z } from 'zod';
import type { ISignalNormalizer, SignalAuthContext } from './isignal-normalizer.interface.js';
import type { MemoryQualitySignal } from './memory-quality-signal.types.js';

const diffScopeSchema = z.object({
  paths: z.array(z.string().min(1)).optional(),
  modules: z.array(z.string().min(1)).optional(),
  adrIds: z.array(z.string().min(1)).optional(),
});

const inspectionOutcomeSchema = z.object({
  type: z.literal('inspection_outcome'),
  source: z.enum(['forge_inspect', 'ci', 'mcp', 'rest']),
  taskId: z.string().min(1).optional(),
  severity: z.enum(['constitutional', 'critical', 'major']),
  category: z.enum(['boundary', 'adr', 'testing', 'security', 'phase_gate']),
  resolved: z.boolean(),
  diffScope: diffScopeSchema.optional(),
  patternHint: z.string().min(1).optional(),
  signalId: z.string().uuid().optional(),
});

export class InspectionOutcomeNormalizer implements ISignalNormalizer {
  normalize(raw: unknown, ctx: SignalAuthContext): MemoryQualitySignal | null {
    const parsed = inspectionOutcomeSchema.safeParse(raw);
    if (!parsed.success) {
      return null;
    }

    const data = parsed.data;
    return {
      signalId: data.signalId ?? crypto.randomUUID(),
      signalType: 'inspection_outcome',
      ownerId: ctx.ownerId,
      workspaceId: ctx.workspaceId,
      payload: {
        kind: 'inspection_outcome',
        source: data.source,
        ...(data.taskId ? { taskId: data.taskId } : {}),
        severity: data.severity,
        category: data.category,
        resolved: data.resolved,
        ...(data.diffScope ? { diffScope: data.diffScope } : {}),
        ...(data.patternHint ? { patternHint: data.patternHint } : {}),
      },
      observedAt: new Date().toISOString(),
    };
  }
}
