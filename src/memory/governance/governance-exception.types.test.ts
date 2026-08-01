import { describe, expect, it } from 'vitest';
import {
  buildGovernanceExceptionRecord,
  CreateGovernanceExceptionBodySchema,
  GovernanceExceptionRecordSchema,
} from './governance-exception.types.js';

describe('governance exception types (PI-1027-B / ADR-1029)', () => {
  it('parses valid create body', () => {
    const body = CreateGovernanceExceptionBodySchema.parse({
      exceptionClass: 'ops_maintenance',
      rationale: 'Scheduled stewardship window',
    });
    expect(body.exceptionClass).toBe('ops_maintenance');
  });

  it('rejects skipTenantCheck and other forbidden fields', () => {
    expect(() =>
      CreateGovernanceExceptionBodySchema.parse({
        exceptionClass: 'decay_protection',
        rationale: 'test',
        skipTenantCheck: true,
      }),
    ).toThrow();
  });

  it('builds pending record with audit entry', () => {
    const record = buildGovernanceExceptionRecord({
      ownerId: 'owner-a',
      exceptionClass: 'feature_flag_off',
      rationale: 'Flag rollout review',
      requestedBy: 'owner-a',
    });
    expect(GovernanceExceptionRecordSchema.parse(record).status).toBe('pending');
    expect(record.auditLog).toHaveLength(1);
    expect(record.auditLog[0]?.action).toBe('requested');
  });
});
