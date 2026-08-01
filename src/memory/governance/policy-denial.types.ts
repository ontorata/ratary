import { randomUUID } from 'node:crypto';
import { z } from 'zod';

export const PolicyDenialPointSchema = z.enum(['write', 'recall', 'stewardship']);
export type PolicyDenialPoint = z.infer<typeof PolicyDenialPointSchema>;

export const PolicyDenialEventSchema = z.object({
  denialId: z.string().min(1),
  ownerId: z.string().min(1),
  point: PolicyDenialPointSchema,
  policyModuleId: z.string().min(1).optional(),
  reasonCode: z.string().min(1),
  occurredAt: z.string().datetime(),
  memoryId: z.string().min(1).optional(),
  resource: z.string().min(1).optional(),
});

export type PolicyDenialEvent = z.infer<typeof PolicyDenialEventSchema>;

export type NewPolicyDenialInput = Readonly<{
  ownerId: string;
  point: PolicyDenialPoint;
  reasonCode: string;
  policyModuleId?: string;
  memoryId?: string;
  resource?: string;
}>;

export function buildPolicyDenialEvent(input: NewPolicyDenialInput): PolicyDenialEvent {
  return PolicyDenialEventSchema.parse({
    denialId: randomUUID(),
    ownerId: input.ownerId,
    point: input.point,
    policyModuleId: input.policyModuleId ?? 'policy-engine',
    reasonCode: input.reasonCode,
    occurredAt: new Date().toISOString(),
    memoryId: input.memoryId,
    resource: input.resource,
  });
}

export type PolicyDenialSummary = Readonly<{
  since: string;
  byPoint: Record<PolicyDenialPoint, number>;
  total: number;
}>;

export function resolvePolicyDenialPoint(path: string, action: 'read' | 'write' | 'admin'): PolicyDenialPoint {
  const normalized = path.toLowerCase();
  if (normalized.includes('stewardship') || normalized.includes('steward')) {
    return 'stewardship';
  }
  if (
    action === 'read' &&
    (normalized.includes('/context') ||
      normalized.includes('/search') ||
      normalized.includes('/recall') ||
      normalized.includes('/graph'))
  ) {
    return 'recall';
  }
  return 'write';
}
