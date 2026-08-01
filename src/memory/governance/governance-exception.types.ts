import { randomUUID } from 'node:crypto';
import { z } from 'zod';

export const GovernanceExceptionClassSchema = z.enum([
  'decay_protection',
  'feature_flag_off',
  'ops_maintenance',
]);

export type GovernanceExceptionClass = z.infer<typeof GovernanceExceptionClassSchema>;

export const GovernanceExceptionStatusSchema = z.enum([
  'pending',
  'approved',
  'rejected',
  'expired',
]);

export type GovernanceExceptionStatus = z.infer<typeof GovernanceExceptionStatusSchema>;

export const GovernanceExceptionAuditEntrySchema = z.object({
  at: z.string().datetime(),
  action: z.string().min(1),
  actor: z.string().min(1).optional(),
  note: z.string().optional(),
});

export type GovernanceExceptionAuditEntry = z.infer<typeof GovernanceExceptionAuditEntrySchema>;

export const GovernanceExceptionRecordSchema = z.object({
  exceptionId: z.string().min(1),
  ownerId: z.string().min(1),
  exceptionClass: GovernanceExceptionClassSchema,
  rationale: z.string().min(1).max(4000),
  status: GovernanceExceptionStatusSchema,
  requestedBy: z.string().min(1),
  requestedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
  auditLog: z.array(GovernanceExceptionAuditEntrySchema),
});

export type GovernanceExceptionRecord = z.infer<typeof GovernanceExceptionRecordSchema>;

/** Request body for POST /governance/exceptions — no skipTenantCheck (ADR-1029). */
export const CreateGovernanceExceptionBodySchema = z
  .object({
    exceptionClass: GovernanceExceptionClassSchema,
    rationale: z.string().min(1).max(4000),
    expiresAt: z.string().datetime().optional(),
  })
  .strict();

export type CreateGovernanceExceptionBody = z.infer<typeof CreateGovernanceExceptionBodySchema>;

export function parseCreateGovernanceExceptionBody(body: unknown): CreateGovernanceExceptionBody {
  return CreateGovernanceExceptionBodySchema.parse(body);
}

export type NewGovernanceExceptionInput = Readonly<{
  ownerId: string;
  exceptionClass: GovernanceExceptionClass;
  rationale: string;
  requestedBy: string;
  expiresAt?: string;
}>;

export function buildGovernanceExceptionRecord(
  input: NewGovernanceExceptionInput,
): GovernanceExceptionRecord {
  const requestedAt = new Date().toISOString();
  return GovernanceExceptionRecordSchema.parse({
    exceptionId: randomUUID(),
    ownerId: input.ownerId,
    exceptionClass: input.exceptionClass,
    rationale: input.rationale,
    status: 'pending',
    requestedBy: input.requestedBy,
    requestedAt,
    expiresAt: input.expiresAt,
    auditLog: [
      {
        at: requestedAt,
        action: 'requested',
        actor: input.requestedBy,
        note: input.rationale,
      },
    ],
  });
}
