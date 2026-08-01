/**
 * Horizon Area 5 (ADR-1040…1046) → Shape D composed Layer 4 bridge registry.
 *
 * Decision Intelligence consumes Ratary (synthesis, provenance) and Ontory Agent
 * Runtime (reasoning). This module does **not** add a DI kernel, fourth memory
 * SoR, or autonomous executive authority.
 */

export const AREA5_DECISION_INTELLIGENCE_MODEL =
  'ratary-area5-decision-intelligence-bridge-v1' as const;

export type Area5HorizonSlot = '1040' | '1041' | '1042' | '1043' | '1044' | '1046';

export type Area5ModuleOwner = 'ratary' | 'ontory-runtime';

export interface Area5HorizonModuleRef {
  readonly slot: Area5HorizonSlot;
  readonly title: string;
  readonly livingAdr: string;
  readonly ownerRepo: Area5ModuleOwner;
  readonly modulePath: string;
  readonly notes: string;
}

export interface Area5DecisionIntelligenceManifest {
  readonly model: typeof AREA5_DECISION_INTELLIGENCE_MODEL;
  readonly shape: 'D';
  readonly owner: 'composed';
  readonly law: readonly ['ADR-1040', 'ADR-069', 'ADR-2110', 'ADR-2112'];
  readonly modules: readonly Area5HorizonModuleRef[];
  readonly partialElsewhere: readonly string[];
  readonly nonGoals: readonly string[];
}

export const AREA5_HORIZON_MODULES: readonly Area5HorizonModuleRef[] = [
  {
    slot: '1040',
    title: 'Decision Intelligence Architecture',
    livingAdr: 'ADR-1040',
    ownerRepo: 'ratary',
    modulePath: 'src/composition/create-provenance-ports.ts',
    notes: 'Composed Layer 4 wiring — Ratary provenance + recall; not a DI SoR.',
  },
  {
    slot: '1041',
    title: 'Knowledge Synthesis Algorithm',
    livingAdr: 'ADR-1041',
    ownerRepo: 'ratary',
    modulePath: 'src/memory/create-context-service.ts',
    notes: 'Hybrid Ratary retrieval → Context Package assembly (ADR-1011).',
  },
  {
    slot: '1042',
    title: 'Recommendation Engine Strategy',
    livingAdr: 'ADR-1042',
    ownerRepo: 'ratary',
    modulePath: 'src/memory/recall/recall-trace.ts',
    notes: 'Evidence/content-based advisory trace; no CF warehouse v1.',
  },
  {
    slot: '1043',
    title: 'Strategic Reasoning Model',
    livingAdr: 'ADR-1043',
    ownerRepo: 'ontory-runtime',
    modulePath: 'src/agent/runtime/agent-runtime-session.ts',
    notes: 'Governed Agent Runtime sessions (Area 4 / ADR-2110); no separate strategy engine.',
  },
  {
    slot: '1044',
    title: 'Decision Support Framework',
    livingAdr: 'ADR-1044',
    ownerRepo: 'ratary',
    modulePath: 'src/knowledge/provenance/chain-walk.ts',
    notes: 'Human-in-loop provenance chains (ADR-069); Studio surfaces support.',
  },
  {
    slot: '1046',
    title: 'Custom Decision Model Plugin',
    livingAdr: 'ADR-1046',
    ownerRepo: 'ontory-runtime',
    modulePath: 'src/agent/decision-model/decision-model-policy.port.ts',
    notes: 'PI-P6-D0 declarative profiles; PI-P6-D1 Node worker sandbox at src/agent/decision-model/node-worker-decision-model-sandbox.ts.',
  },
] as const;

export function getArea5DecisionIntelligenceManifest(): Area5DecisionIntelligenceManifest {
  return {
    model: AREA5_DECISION_INTELLIGENCE_MODEL,
    shape: 'D',
    owner: 'composed',
    law: ['ADR-1040', 'ADR-069', 'ADR-2110', 'ADR-2112'],
    modules: AREA5_HORIZON_MODULES,
    partialElsewhere: [
      'ADR-1045 Ratary graph / code-memory (not Neo4j SoR)',
      'ADR-1047 decision provenance via ADR-069',
      'ADR-1048 eval stack ADR-2105…2107 / 2118',
      'ADR-1049 explainability ADR-2136',
    ],
    nonGoals: [
      'Fourth organizational memory SoR',
      'Second Agent Runtime product',
      'DI kernel or ACOS mid-tier tenancy owner',
      'Collaborative-filtering recommendation warehouse',
      'Neo4j as org-knowledge SoR',
      'Autonomous executive authority without human Accept',
      'P6 product PI (Layer 4 UX) — architecture bridge only',
    ],
  };
}

export function listArea5HorizonSlots(): Area5HorizonSlot[] {
  return AREA5_HORIZON_MODULES.map((m) => m.slot);
}
