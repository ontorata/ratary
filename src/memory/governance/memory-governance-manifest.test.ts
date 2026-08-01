import { describe, expect, it } from 'vitest';
import {
  getMemoryGovernanceManifest,
  listMemoryGovernancePoints,
  MEMORY_GOVERNANCE_MODEL,
  MEMORY_GOVERNANCE_MODULES,
} from './memory-governance-manifest.js';

describe('memory governance manifest (ADR-1020/1021)', () => {
  it('exposes Shape G Ratary-owned model with three evaluation points', () => {
    const manifest = getMemoryGovernanceManifest();
    expect(manifest.model).toBe(MEMORY_GOVERNANCE_MODEL);
    expect(manifest.shape).toBe('G');
    expect(manifest.owner).toBe('ratary');
    expect(manifest.updateMechanism).toBe('git-pr-ci-deploy-flag');
    expect(listMemoryGovernancePoints().sort()).toEqual(['recall', 'stewardship', 'write']);
  });

  it('maps each module to a write|recall|stewardship point with enforcement class', () => {
    expect(MEMORY_GOVERNANCE_MODULES.length).toBeGreaterThanOrEqual(5);
    for (const mod of MEMORY_GOVERNANCE_MODULES) {
      expect(['write', 'recall', 'stewardship']).toContain(mod.point);
      expect(['hard', 'soft']).toContain(mod.enforcement);
      expect(mod.modulePath.startsWith('src/')).toBe(true);
    }
    expect(MEMORY_GOVERNANCE_MODULES.some((m) => m.enforcement === 'hard')).toBe(true);
  });

  it('rejects sidecar / OPA / skipTenant goals in nonGoals', () => {
    const { nonGoals } = getMemoryGovernanceManifest();
    expect(nonGoals.join(' ')).toMatch(/OPA/);
    expect(nonGoals.join(' ')).toMatch(/skipTenantCheck/);
    expect(nonGoals.join(' ')).toMatch(/separate/i);
  });
});
