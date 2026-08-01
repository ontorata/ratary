/**
 * Horizon Area 6 (ADR-1050…1058 ops) → cross-cutting ops bridge registry.
 *
 * Monitoring, CI/CD, and performance are **product-owned** practices consuming
 * shared telemetry contracts (1050). This module does **not** add an ACOS
 * megamonitor, monorepo deploy controller, or global performance layer.
 */

export const AREA6_OPS_BRIDGE_MODEL = 'ratary-area6-ops-bridge-v1' as const;

export type Area6HorizonSlot = '1050' | '1051' | '1056' | '1058';

export type Area6ModuleOwner = 'ratary' | 'ontory-runtime';

export interface Area6HorizonModuleRef {
  readonly slot: Area6HorizonSlot;
  readonly title: string;
  readonly livingAdr: string;
  readonly ownerRepo: Area6ModuleOwner;
  readonly modulePath: string;
  readonly notes: string;
}

export interface Area6OpsBridgeManifest {
  readonly model: typeof AREA6_OPS_BRIDGE_MODEL;
  readonly shape: 'X';
  readonly owner: 'cross-cutting';
  readonly law: readonly ['ADR-1050', 'ADR-015', 'ADR-2102', 'ADR-2104'];
  readonly modules: readonly Area6HorizonModuleRef[];
  readonly partialElsewhere: readonly string[];
  readonly nonGoals: readonly string[];
}

export const AREA6_HORIZON_MODULES: readonly Area6HorizonModuleRef[] = [
  {
    slot: '1050',
    title: 'Runtime Telemetry Architecture',
    livingAdr: 'ADR-1050',
    ownerRepo: 'ontory-runtime',
    modulePath: 'src/runtime/telemetry/contracts.ts',
    notes: 'Semantic telemetry taxonomy; sinks via ADR-2104 — not selection-engine ownership.',
  },
  {
    slot: '1051',
    title: 'ACOS Monitoring & Alerting',
    livingAdr: 'ADR-1051',
    ownerRepo: 'ratary',
    modulePath: 'observability/slo/slo-definitions.json',
    notes: 'Product ops on 1050 signals + ADR-015 availability; no ACOS megamonitor v1.',
  },
  {
    slot: '1056',
    title: 'ACOS CI/CD Pipeline',
    livingAdr: 'ADR-1056',
    ownerRepo: 'ratary',
    modulePath: '.github/workflows/ci.yml',
    notes: 'Per-product GitHub Actions pattern; docs-ai ≠ deploy controller.',
  },
  {
    slot: '1058',
    title: 'ACOS Performance Optimization',
    livingAdr: 'ADR-1058',
    ownerRepo: 'ontory-runtime',
    modulePath: 'tests/fitness/',
    notes: 'Evidence-driven hotspots via fitness suites + telemetry; no mid-tier perf layer.',
  },
] as const;

export function getArea6OpsBridgeManifest(): Area6OpsBridgeManifest {
  return {
    model: AREA6_OPS_BRIDGE_MODEL,
    shape: 'X',
    owner: 'cross-cutting',
    law: ['ADR-1050', 'ADR-015', 'ADR-2102', 'ADR-2104'],
    modules: AREA6_HORIZON_MODULES,
    partialElsewhere: [
      'ADR-1052 security via ADR-013 / ADR-006',
      'ADR-1053 Provider Selection superseded by ADR-2102 (do not reuse for Deployment Model)',
      'ADR-1054 stack via ADR-2120',
      'ADR-1055 testing strategy impl-without-slot (fitness suites)',
      'ADR-1057 error handling impl-without-slot (ProviderError shapes)',
      'ADR-1059 scalability partial via ADR-015 / serving ADRs',
    ],
    nonGoals: [
      'Unified ACOS NOC / megamonitor as SoR',
      'Single monorepo CI deploying all product surfaces',
      'docs-ai commits as deploy triggers',
      'Global performance layer between Studio and backends',
      'Reusing ADR-1053 number for Deployment Model',
      'Trading fail-closed tenancy/governance for speed',
    ],
  };
}

export function listArea6HorizonSlots(): Area6HorizonSlot[] {
  return AREA6_HORIZON_MODULES.map((m) => m.slot);
}
