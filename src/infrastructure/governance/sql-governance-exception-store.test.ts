import { describe, expect, it } from 'vitest';
import { InMemoryGovernanceExceptionStore } from '../../memory/governance/in-memory-governance-exception-store.js';

describe('GovernanceExceptionStore (in-memory parity)', () => {
  it('scopes list and getById to owner', async () => {
    const store = new InMemoryGovernanceExceptionStore();
    const created = await store.create({
      ownerId: 'owner-a',
      exceptionClass: 'ops_maintenance',
      rationale: 'Dry-run review',
      requestedBy: 'owner-a',
    });
    await store.create({
      ownerId: 'owner-b',
      exceptionClass: 'decay_protection',
      rationale: 'Other tenant',
      requestedBy: 'owner-b',
    });

    const listA = await store.list('owner-a');
    expect(listA).toHaveLength(1);
    expect(listA[0]?.exceptionId).toBe(created.exceptionId);

    expect(await store.getById('owner-b', created.exceptionId)).toBeNull();
    expect(await store.getById('owner-a', created.exceptionId)).not.toBeNull();
  });

  it('appends audit on updateStatus', async () => {
    const store = new InMemoryGovernanceExceptionStore();
    const created = await store.create({
      ownerId: 'owner-a',
      exceptionClass: 'feature_flag_off',
      rationale: 'Rollout',
      requestedBy: 'owner-a',
    });
    const updated = await store.updateStatus('owner-a', created.exceptionId, 'approved', {
      at: new Date().toISOString(),
      action: 'approved',
      actor: 'owner-a',
    });
    expect(updated?.status).toBe('approved');
    expect(updated?.auditLog).toHaveLength(2);
  });
});
