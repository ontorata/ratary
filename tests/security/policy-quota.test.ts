import { describe, it, expect } from 'vitest';
import { AllowAllPolicyEngine } from '../../src/security/adapters/allow-all-policy-engine.js';
import { RuleBasedPolicyEngine } from '../../src/security/adapters/rule-based-policy-engine.js';
import type { ITenantHierarchy } from '../../src/security/ports/itenant-hierarchy.port.js';
import type { PolicyEvaluationInput } from '../../src/security/types/security.types.js';
import { QuotaExceededError } from '../../src/types/errors.js';
import { MemoryQuotaEnforcer } from '../../src/security/adapters/memory-quota-enforcer.js';

const baseInput: PolicyEvaluationInput = {
  user: {
    ownerId: 'owner-1',
    identityId: 'identity-1',
    identityType: 'api_key',
    clientId: null,
    permissions: ['memory.read'],
  },
  scope: { ownerId: 'owner-1', organizationId: 'org-1' },
  hierarchy: { organizationId: 'org-1' },
  method: 'GET',
  path: '/api/v1/memory',
  action: 'read',
};

describe('AllowAllPolicyEngine', () => {
  it('allows all requests', async () => {
    const engine = new AllowAllPolicyEngine();
    const result = await engine.evaluate(baseInput);
    expect(result.allowed).toBe(true);
  });
});

describe('RuleBasedPolicyEngine', () => {
  it('denies when deny binding matches path', async () => {
    const hierarchy: ITenantHierarchy = {
      getDepartment: async () => null,
      getProject: async () => null,
      listDepartments: async () => [],
      listProjects: async () => [],
      resolveHierarchyForWorkspace: async () => ({ organizationId: 'org-1' }),
      listPolicyBindings: async () => [
        {
          id: 'pol-1',
          organizationId: 'org-1',
          policyPackage: 'deny-writes',
          effect: 'deny',
          resourcePattern: '/api/v1/memory*',
        },
      ],
    };

    const engine = new RuleBasedPolicyEngine(hierarchy);
    const result = await engine.evaluate({
      ...baseInput,
      method: 'POST',
      path: '/api/v1/memory',
      action: 'write',
    });
    expect(result.allowed).toBe(false);
  });
});

describe('MemoryQuotaEnforcer', () => {
  it('throws QuotaExceededError when rate limit exceeded', async () => {
    const enforcer = new MemoryQuotaEnforcer({
      maxRequestsPerMinute: 2,
      maxWritesPerDay: 100,
    });

    await enforcer.assertWithinQuota({ ...baseInput, action: 'read' });
    await enforcer.assertWithinQuota({ ...baseInput, action: 'read' });

    await expect(
      enforcer.assertWithinQuota({ ...baseInput, action: 'read' }),
    ).rejects.toBeInstanceOf(QuotaExceededError);
  });
});
