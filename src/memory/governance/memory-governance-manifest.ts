/**
 * ADR-1020 / ADR-1021 — Memory Governance evaluation-point registry (v1).
 *
 * This is **not** a separate policy product and **not** `IPolicyEngine`
 * (security/authz). Org-memory policy runs as versioned TypeScript modules
 * inside Ratary at write, recall, and stewardship points (Shape G).
 */

export const MEMORY_GOVERNANCE_MODEL = 'ratary-memory-governance-v1' as const;

export type MemoryGovernanceEvaluationPoint = 'write' | 'recall' | 'stewardship';

export type MemoryGovernanceEnforcementClass = 'hard' | 'soft';

export interface MemoryGovernanceModuleRef {
  readonly id: string;
  readonly point: MemoryGovernanceEvaluationPoint;
  readonly enforcement: MemoryGovernanceEnforcementClass;
  /** Repo-relative path to the living module (documentation SoT for agents). */
  readonly modulePath: string;
  readonly notes: string;
}

export interface MemoryGovernanceManifest {
  readonly model: typeof MEMORY_GOVERNANCE_MODEL;
  readonly shape: 'G';
  readonly owner: 'ratary';
  /** Ship path for policy updates (ADR-1026) — no remote pack CDN. */
  readonly updateMechanism: 'git-pr-ci-deploy-flag';
  readonly modules: readonly MemoryGovernanceModuleRef[];
  readonly nonGoals: readonly string[];
}

/** Living map of Area 3 evaluation points → code modules. */
export const MEMORY_GOVERNANCE_MODULES: readonly MemoryGovernanceModuleRef[] = [
  {
    id: 'tenancy-owner-scope',
    point: 'write',
    enforcement: 'hard',
    modulePath: 'src/auth/permission-context.ts',
    notes: 'Owner/tenant scope on mutations — fail closed (ADR-012 / ADR-1028).',
  },
  {
    id: 'write-validation-idempotency',
    point: 'write',
    enforcement: 'hard',
    modulePath: 'src/infrastructure/write-intents/sql-write-intent-store.ts',
    notes: 'Schema + idempotent write intents; no skipTenantCheck API.',
  },
  {
    id: 'recall-policy-ranking',
    point: 'recall',
    enforcement: 'soft',
    modulePath: 'src/memory/recall/recall-policy.port.ts',
    notes: 'IRecallPolicy shapes Context Package inputs; flag-gated sources preferred.',
  },
  {
    id: 'stewardship-pipeline',
    point: 'stewardship',
    enforcement: 'soft',
    modulePath: 'src/memory/stewardship/memory-stewardship-orchestrator.ts',
    notes: 'Ordered stages (ADR-045); dry-run default; decay under ADR-066 flags.',
  },
  {
    id: 'decay-governance-protection',
    point: 'stewardship',
    enforcement: 'soft',
    modulePath: 'src/memory/decay/decay-signals.ts',
    notes: 'Favorite / high-importance / governance tags — ADR-1029 exception class.',
  },
] as const;

export function getMemoryGovernanceManifest(): MemoryGovernanceManifest {
  return {
    model: MEMORY_GOVERNANCE_MODEL,
    shape: 'G',
    owner: 'ratary',
    updateMechanism: 'git-pr-ci-deploy-flag',
    modules: MEMORY_GOVERNANCE_MODULES,
    nonGoals: [
      'OPA/Rego required runtime',
      'Separate Memory Policy Engine service',
      'Studio/Ontory org-memory policy SoR',
      'Unsigned remote policy pack CDN',
      'Client skipTenantCheck',
      'Governance dashboard product (ADR-1027 deferred)',
    ],
  };
}

export function listMemoryGovernancePoints(): MemoryGovernanceEvaluationPoint[] {
  return [...new Set(MEMORY_GOVERNANCE_MODULES.map((m) => m.point))];
}
