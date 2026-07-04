#!/usr/bin/env node
/**
 * Enrich CHECKLIST.md with phase-specific gate items and close stale REVIEW lines.
 * Run: node scripts/enrich-phase-checklists.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const PHASES_DIR = path.join(ROOT, '.ai', 'phases');

const REGRESSION = '689 passed, 3 skipped (default env)';

const FOOTER =
  '\n---\n\n*Frozen at gate PASS. Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*\n';

/** @type {Array<{dir:string,title:string,gateDate:string,adr?:string,flag?:string,sections:Array<{name:string,items:Array<[boolean,string]>}>}>} */
const FULL = [
  {
    dir: '01-foundation',
    title: 'Phase 1 — Foundation',
    gateDate: '2026-06-28',
    tests: 'baseline suite green at gate',
    sections: [
      {
        name: 'Core deliverables',
        items: [
          [true, 'D1 schema — `memories`, `identities`, `clients`, `audit_logs`, `settings`'],
          [true, '`runMigrations()` forward-only runner + `schema.sql` snapshot'],
          [true, '`IMemoryRepository` port + D1 adapter'],
          [true, '`MemoryService` CRUD orchestration'],
          [true, 'REST Fastify server — `/api/v1/memory`, health'],
          [true, 'MCP stdio server — memory tools catalog'],
          [true, 'MockD1 test harness'],
        ],
      },
      {
        name: 'Quality gate',
        items: [
          [true, 'lint + typecheck + format green'],
          [true, 'Baseline Vitest suite green at gate'],
          [true, 'MCP + REST semantic parity verified'],
        ],
      },
      {
        name: 'Documentation',
        items: [
          [true, 'Phase folder governance docs closed'],
          [true, '[DESIGN.md](DESIGN.md) · [IMPLEMENTATION.md](IMPLEMENTATION.md) · [COMPLETION.md](COMPLETION.md)'],
        ],
      },
    ],
  },
  {
    dir: '03-authorization',
    title: 'Phase 3 — Authorization',
    gateDate: '2026-06-30',
    tests: 'auth regression suite green',
    sections: [
      {
        name: 'Implementation',
        items: [
          [true, '`AuthService` + provider chain'],
          [true, 'API key provider — hash/compare via `identities.secret_hash`'],
          [true, 'Fastify `auth.middleware` on protected routes'],
          [true, '`IdentityRepository` last_used tracking'],
          [true, 'REST `/api/v1/auth/*` key management'],
        ],
      },
      {
        name: 'Security',
        items: [
          [true, '401 on missing/invalid credentials'],
          [true, 'Owner binding — no header override spoofing'],
          [true, 'Never log raw API keys'],
          [true, 'Reuses Phase 1 schema — no new DDL'],
        ],
      },
      {
        name: 'Quality gate',
        items: [
          [true, 'Auth E2E regression tests green'],
          [true, '`MCP_OWNER_ID` documented for production MCP'],
          [true, 'Governance docs closed at gate'],
        ],
      },
    ],
  },
  {
    dir: '04-memory-intelligence',
    title: 'Phase 4 — Memory Intelligence',
    gateDate: '2026-07-01',
    adr: 'ADR-004',
    tests: 'memory intelligence regression green',
    sections: [
      {
        name: 'Pipeline modules',
        items: [
          [true, '`Retriever` + `IRetrievalCandidateSource`'],
          [true, '`Ranker` wrapping pure `RankingEngine`'],
          [true, '`ContextBuilder` token budget assembly'],
          [true, '`PromptBuilder` final prompt string'],
          [true, '`MemoryConsolidator` batch hygiene path'],
        ],
      },
      {
        name: 'Repository / performance',
        items: [
          [true, '`recordAccessBatch` — single UPDATE'],
          [true, '`MEMORY_SELECT` explicit projection (O-04-2)'],
          [true, 'Importance scoring on write path'],
          [true, '`migrateMemoryIntelligencePhase1/3` indexes'],
          [true, 'Backfill script dry-run default'],
        ],
      },
      {
        name: 'Quality gate',
        items: [
          [true, 'Cross-owner leak regression tests'],
          [true, 'Design archive: [PHASE-4-MEMORY-INTELLIGENCE-DESIGN.md](../../../docs/archive/PHASE-4-MEMORY-INTELLIGENCE-DESIGN.md)'],
          [true, 'Governance docs closed at gate'],
        ],
      },
    ],
  },
  {
    dir: '16-developer-platform',
    title: 'Phase 16 — Developer Platform',
    gateDate: '2026-07-04',
    adr: 'ADR-031',
    sections: [
      {
        name: 'Packages',
        items: [
          [true, 'ADR-031 Implemented'],
          [true, 'OpenAPI snapshot pipeline (`snapshot:openapi`, `build:packages`)'],
          [true, '`@ai-brain/sdk` TypeScript reference client'],
          [true, '`@ai-brain/cli` uses SDK only — no direct fetch'],
          [true, '`@ai-brain/mcp-server` uses SDK only'],
          [true, '6 language thin wrappers + manifest `transport.sdk`'],
        ],
      },
      {
        name: 'Compatibility',
        items: [
          [true, 'Server `MemoryService` unchanged'],
          [true, 'REST v1 memory routes unchanged'],
          [true, 'Default env regression green'],
        ],
      },
      {
        name: 'Deferred',
        items: [
          [false, 'Dashboard SPA'],
          [false, 'SDK admin methods for Phase 20/24 platform APIs'],
        ],
      },
    ],
  },
  {
    dir: '17-enterprise-security',
    title: 'Phase 17 — Enterprise Security',
    gateDate: '2026-07-04',
    adr: 'ADR-032',
    flag: 'ENTERPRISE_SECURITY_V2=false',
    sections: [
      {
        name: 'Implementation',
        items: [
          [true, 'ADR-032 Implemented'],
          [true, '`migrateEnterprisePhase2` — departments, policy_bindings'],
          [true, '`ITenantHierarchy` + SQL store'],
          [true, '`IPolicyEngine` — allow-all, rule-based, OPA adapter'],
          [true, '`IIdentityFederation` + OIDC SSO routes'],
          [true, '`IQuotaEnforcer` + edge middleware pipeline'],
          [true, '`IComplianceAuditor` export path'],
        ],
      },
      {
        name: 'Boundaries',
        items: [
          [true, 'Auth → RBAC → policy → quota → handlers'],
          [true, '`MemoryService` unchanged — resolved `MemoryScope` only'],
          [true, 'Bridges Phase 13.1 MCP OAuth via OIDC provider'],
        ],
      },
      {
        name: 'Deferred',
        items: [
          [false, 'Live IdP vendor smoke (Azure/Okta/Keycloak/Google stubs)'],
          [false, 'Bundled OPA policy examples'],
        ],
      },
    ],
  },
];

const PATCHES = [
  {
    dir: '13-protocol-layer',
    replacements: [
      ['- [ ] REVIEW PASS (formal gate pending)', '- [x] [REVIEW.md](REVIEW.md) PASS — 2026-07-04'],
    ],
    appendGate: { gateDate: '2026-07-04', adr: 'ADR-028', tests: REGRESSION },
  },
  {
    dir: '13.1-remote-mcp-clients',
    replacements: [
      ['- [ ] REVIEW.md PASS', '- [x] [REVIEW.md](REVIEW.md) PASS — 2026-07-04'],
    ],
  },
  {
    dir: '14-federation',
    replacements: [
      ['- [ ] REVIEW PASS', '- [x] [REVIEW.md](REVIEW.md) PASS — 2026-07-04'],
    ],
    appendGate: { gateDate: '2026-07-04', adr: 'ADR-029', flag: 'FEDERATION_ENABLED=false', tests: REGRESSION },
  },
  {
    dir: '15-autonomous-agent-ecosystem',
    replacements: [
      ['- [ ] REVIEW PASS', '- [x] [REVIEW.md](REVIEW.md) PASS — 2026-07-04'],
    ],
    appendGate: { gateDate: '2026-07-04', adr: 'ADR-030', tests: REGRESSION },
  },
  {
    dir: '18-cloud-platform',
    replacements: [
      [
        '- [x] [SUCCESS_CRITERIA.md](SUCCESS_CRITERIA.md) PASS (automated gates)',
        '- [x] [REVIEW.md](REVIEW.md) PASS — 2026-07-04',
      ],
    ],
    appendGate: { gateDate: '2026-07-04', adr: 'ADR-033', tests: REGRESSION },
  },
  {
    dir: '20-ai-infrastructure',
    replacements: [
      [
        '- [x] [SUCCESS_CRITERIA.md](SUCCESS_CRITERIA.md) core SC pass',
        '- [x] [REVIEW.md](REVIEW.md) PASS — 2026-07-04',
      ],
    ],
    appendGate: { gateDate: '2026-07-04', adr: 'ADR-035', flag: 'PLUGIN_MARKETPLACE_ENABLED=false', tests: REGRESSION },
  },
];

const APPEND_GATE_ONLY = [
  { dir: '21-search-graph-prod', gateDate: '2026-07-04', adr: 'ADR-022', flag: 'SEARCH_GRAPH_PLATFORM_ENABLED=false', tests: REGRESSION },
  { dir: '22-content-scale', gateDate: '2026-07-04', adr: 'ADR-021', flag: 'CONTENT_SCALE_PLATFORM_ENABLED=false', tests: REGRESSION },
  { dir: '23-enterprise-knowledge-fabric', gateDate: '2026-07-04', adr: 'ADR-047', flag: 'KNOWLEDGE_FABRIC_ENABLED=false', tests: REGRESSION },
  { dir: '24-ai-brain-platform', gateDate: '2026-07-04', adr: 'ADR-044', flag: 'AI_BRAIN_PLATFORM_ENABLED=false', tests: REGRESSION },
  { dir: '25-global-ai-intelligence', gateDate: '2026-07-04', adr: 'ADR-036/037/038/043', flag: 'GLOBAL_INTELLIGENCE_PLATFORM_ENABLED=false', tests: REGRESSION },
  { dir: '19-observability-platform', gateDate: '2026-07-04', adr: 'ADR-034', flag: 'OBSERVABILITY_PLATFORM=false', tests: REGRESSION },
];

const SKIP = new Set([
  '02.5-stabilization',
  '02.6-knowledge',
  '05-embedding',
  '06-hybrid-retrieval',
  '07-agent-runtime',
  '08-knowledge-graph',
  '09-multi-ai',
  '09.5-platform-architecture',
  '10-enterprise',
  '10.5-transport-connectivity',
  '11-production-ops',
  '04.7-memory-stewardship',
  '05.5-semantic-compression',
  '06.5-progressive-retrieval',
  '07.5-runtime-compatibility',
  '08.5-observation-reflection-learning',
  '08.6-learning-intelligence',
  '08.7-graph-relation-inference',
  '09.7-memory-evolution',
  '09.8-multi-client-sync',
  '12-event-pipeline',
]);

function isScaffold(content) {
  return content.includes('Derived from [review/01-PHASE-CHECKLIST.md]') && content.includes('All items checked at gate');
}

function renderSections(sections) {
  return sections
    .map(({ name, items }) => {
      const rows = items.map(([done, text]) => `- [${done ? 'x' : ' '}] ${text}`).join('\n');
      return `## ${name}\n\n${rows}`;
    })
    .join('\n\n---\n\n');
}

function renderFull(p) {
  const adrLine = p.adr ? ` · **ADR:** ${p.adr}` : '';
  const flagLine = p.flag ? `\n**Master flag:** \`${p.flag}\`` : '';
  return `# ${p.title} — CHECKLIST

**Phase status:** Closed  
**Gate:** PASS ${p.gateDate}  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)${adrLine}${flagLine}

---

## Purpose

Executable gate checklist — one item per milestone or success criterion.

---

${renderSections(p.sections)}

---

## Gate decision

| Field | Value |
|-------|-------|
| **Verdict** | **PASS** — ${p.gateDate} |
${p.adr ? `| **ADR** | ${p.adr} |\n` : ''}${p.flag ? `| **Master flag** | \`${p.flag}\` (default OFF) |\n` : ''}| **Regression** | ${p.tests ?? REGRESSION} |
| **Review** | [REVIEW.md](REVIEW.md) PASS |

${FOOTER}`;
}

function gateBlock(g) {
  return `

---

## Gate decision

| Field | Value |
|-------|-------|
| **Verdict** | **PASS** — ${g.gateDate} |
| **ADR** | ${g.adr} |
${g.flag ? `| **Master flag** | \`${g.flag}\` (default OFF) |\n` : ''}| **Regression** | ${g.tests} |
| **Review** | [REVIEW.md](REVIEW.md) PASS |

${FOOTER.trim()}`;
}

function applyPatches(content, patch) {
  let next = content;
  for (const [old, rep] of patch.replacements ?? []) {
    if (next.includes(old)) next = next.replace(old, rep);
  }
  if (patch.appendGate && !next.includes('## Gate decision')) {
    next = next.trimEnd() + gateBlock(patch.appendGate);
  }
  // Normalize footer
  if (!next.includes('Frozen at gate PASS')) {
    next = next.replace(/\*Subordinate to.*\*\.?\s*$/m, '').trimEnd();
    if (!next.includes('Frozen at gate PASS')) next += FOOTER;
  }
  return next;
}

let updated = 0;
let skipped = 0;

for (const p of FULL) {
  const file = path.join(PHASES_DIR, p.dir, 'CHECKLIST.md');
  const existing = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (SKIP.has(p.dir) && !isScaffold(existing)) {
    console.log('skip (rich content)', p.dir);
    skipped++;
    continue;
  }
  if (!isScaffold(existing) && p.dir !== '16-developer-platform' && p.dir !== '17-enterprise-security') {
    console.log('skip (already enriched)', p.dir);
    skipped++;
    continue;
  }
  fs.writeFileSync(file, renderFull(p));
  updated++;
  console.log('updated (full)', p.dir);
}

for (const patch of PATCHES) {
  const file = path.join(PHASES_DIR, patch.dir, 'CHECKLIST.md');
  if (!fs.existsSync(file)) continue;
  const existing = fs.readFileSync(file, 'utf8');
  const next = applyPatches(existing, patch);
  if (next !== existing) {
    fs.writeFileSync(file, next);
    updated++;
    console.log('patched', patch.dir);
  } else {
    console.log('unchanged', patch.dir);
  }
}

for (const g of APPEND_GATE_ONLY) {
  const file = path.join(PHASES_DIR, g.dir, 'CHECKLIST.md');
  if (!fs.existsSync(file)) continue;
  const existing = fs.readFileSync(file, 'utf8');
  if (existing.includes('## Gate decision')) {
    console.log('skip (has gate)', g.dir);
    skipped++;
    continue;
  }
  fs.writeFileSync(file, existing.trimEnd() + gateBlock(g));
  updated++;
  console.log('appended gate', g.dir);
}

console.log(`\nUpdated ${updated} CHECKLIST.md files; skipped ${skipped}.`);
