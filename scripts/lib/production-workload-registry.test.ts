import { describe, expect, it } from 'vitest';
import { summarizeRegistry, type ProductionWorkloadRegistry } from './production-workload-registry.js';

const fixture: ProductionWorkloadRegistry = {
  schemaVersion: '1.0',
  updated: '2026-08-02',
  organizations: [
    {
      id: 'ontorata',
      name: 'Ontorata',
      type: 'internal',
      trusted: true,
      activeSince: '2026-07-08',
      evidencePath: 'docs-ai/reviews/org-memory-dogfood/',
    },
    {
      id: 'acme',
      name: 'Acme',
      type: 'external',
      trusted: false,
      activeSince: '2026-08-01',
      evidencePath: 'docs-ai/reviews/pilot-001/',
    },
  ],
  workloads: [
    {
      id: 'org-memory-dogfood',
      organizationId: 'ontorata',
      name: 'Org Memory Dogfood',
      type: 'internal',
      trusted: true,
      northStarEligible: true,
      activeSince: '2026-07-08',
      evidencePath: 'docs-ai/reviews/org-memory-dogfood/P1-A-ACCEPTANCE.md',
    },
    {
      id: 'pilot-wedge',
      organizationId: 'acme',
      name: 'Pilot',
      type: 'external',
      trusted: false,
      northStarEligible: true,
      activeSince: '2026-08-01',
      evidencePath: 'docs-ai/reviews/pilot-001/',
    },
  ],
};

describe('production-workload-registry', () => {
  it('counts trusted internal orgs and north-star workloads', () => {
    const summary = summarizeRegistry(fixture);
    expect(summary.productionOrganizations).toBe(1);
    expect(summary.productionWorkloads).toBe(1);
    expect(summary.externalOrganizations).toBe(0);
    expect(summary.externalWorkloads).toBe(0);
    expect(summary.northStarWorkloads).toBe(1);
  });
});
