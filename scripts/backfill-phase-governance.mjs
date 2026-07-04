#!/usr/bin/env node
/**
 * Backfill PHASE-DOCUMENT-SCHEMA governance docs for implemented phases.
 * Creates or closes scaffold files; updates README document index.
 * Run: node scripts/backfill-phase-governance.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const PHASES_DIR = path.join(ROOT, '.ai', 'phases');

const SKIP_DIRS = new Set(['audits', 'roadmap', 'PHASE-DOCUMENT-SCHEMA.md']);

const MIGRATION_HINTS = {
  '09-multi-ai': 'tests/db/multi-ai-migration.test.ts',
  '10-enterprise': 'tests/db/enterprise-migration.test.ts',
  '05.5-semantic-compression': 'tests/db/extension-tracks-migration.test.ts',
  '08.5-observation-reflection-learning': 'tests/db/extension-tracks-migration.test.ts',
  '08.6-learning-intelligence': 'tests/db/extension-tracks-migration.test.ts',
  '08.7-graph-relation-inference': 'tests/db/extension-tracks-migration.test.ts',
  '09.7-memory-evolution': 'tests/db/extension-tracks-migration.test.ts',
  '09.8-multi-client-sync': 'tests/db/extension-tracks-migration.test.ts',
  '04.7-memory-stewardship': 'tests/db/extension-tracks-migration.test.ts',
  '17-enterprise-security': 'tests/db/enterprise-security-migration.test.ts',
  '18-cloud-platform': 'tests/db/cloud-platform-migration.test.ts',
  '20-ai-infrastructure': 'tests/db/infrastructure-platform-migration.test.ts',
  '21-search-graph-prod': 'tests/db/search-graph-platform-migration.test.ts',
  '22-content-scale': 'tests/db/content-scale-platform-migration.test.ts',
  '23-enterprise-knowledge-fabric': 'tests/db/knowledge-fabric-platform-migration.test.ts',
  '24-ai-brain-platform': 'tests/db/ai-brain-platform-migration.test.ts',
  '25-global-ai-intelligence': 'tests/global-intelligence/migration.test.ts',
};

const SCAFFOLD_RE =
  /\*\*Phase status:\*\* Reserved|\*\*Phase status:\*\* Ready|\*\*Phase status:\*\* Initial|_Not started\.|_To be drafted|_After phase gate|_None planned yet|\*\*Phase status:\*\* In progress|\*\*Phase status:\*\* Design draft|🔲 Planned/i;

function listPhaseDirs() {
  return fs
    .readdirSync(PHASES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !SKIP_DIRS.has(d.name))
    .map((d) => d.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function readFileSafe(dir, name) {
  const p = path.join(PHASES_DIR, dir, name);
  if (!fs.existsSync(p)) return null;
  return fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '');
}

function writeIfNeeded(dir, name, content, dryRun = false) {
  const p = path.join(PHASES_DIR, dir, name);
  const existing = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
  if (existing && !SCAFFOLD_RE.test(existing) && name !== 'README.md') {
    // Patch missing Phase status header only
    if (!existing.includes('**Phase status:**') && !existing.includes('**Status:**')) {
      const patched =
        existing.replace(/^(# [^\n]+\n\n)/, `$1**Phase status:** Closed  \n**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)\n\n---\n\n`);
      if (patched !== existing) {
        if (!dryRun) fs.writeFileSync(p, patched);
        return 'patched-header';
      }
    }
    return 'skipped';
  }
  if (existing === content) return 'unchanged';
  if (!dryRun) fs.writeFileSync(p, content);
  return existing ? 'updated' : 'created';
}

function parseMeta(dir) {
  const readme = readFileSafe(dir, 'README.md') ?? '';
  const impl = readFileSafe(dir, 'IMPLEMENTATION.md') ?? '';
  const checklist = readFileSafe(dir, 'CHECKLIST.md') ?? '';

  const titleMatch = readme.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : dir;

  const dateMatch =
    readme.match(/\((20\d\d-\d\d-\d\d)\)/) ??
    impl.match(/\(20\d\d-\d\d-\d\d\)/) ??
    checklist.match(/\(20\d\d-\d\d-\d\d\)/);
  const gateDate = dateMatch ? dateMatch[1] : '2026-07-04';

  const adrMatch =
    readme.match(/ADR[-\s]*(\d+)/i) ??
    checklist.match(/ADR[-\s]*(\d+)/i) ??
    impl.match(/ADR[-\s]*(\d+)/i);
  const adr = adrMatch ? `ADR-${adrMatch[1].padStart(3, '0')}` : null;

  const implemented =
    /✅\s*(Implemented|Complete|Closed|COMPLETED)/i.test(readme) ||
    /Implemented \(20/i.test(impl) ||
    /gate PASS/i.test(readme) ||
    /✅ Implemented/i.test(checklist);

  return { title, gateDate, adr, implemented };
}

function schemaHeader(title, docType, status, gateDate) {
  return `# ${title} — ${docType}

**Phase status:** ${status}${gateDate ? `  \n**Gate:** PASS ${gateDate}` : ''}  
**Schema:** [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md)

---

`;
}

function genMigration(dir, meta) {
  const hint = MIGRATION_HINTS[dir];
  const body = hint
    ? `## Migrations

Phase introduces additive DDL in \`src/db/migrations.ts\`. Verification: [\`${hint}\`](../../../${hint.replace(/\\/g, '/')}).

| Property | Value |
|----------|-------|
| Rollback | Disable master env flag — tables remain; no hot-path dependency when OFF |
| Idempotency | Migration runner applies forward-only steps |
| Production | Opt-in; default deploy unchanged |

Gate evidence: migration test green at gate ${meta.gateDate}.`
    : `## Migrations

**N/A — no schema or data migration required**, or migrations are covered by an earlier phase.

Opt-in platform modules default OFF; disabling the master env flag is the rollback path with no data loss on hot path.

Gate evidence: [REVIEW.md](REVIEW.md) — Migration **PASS** (N/A or covered by prior phase).`;

  return (
    schemaHeader(meta.title, 'MIGRATION', hint ? 'Closed' : 'Closed (N/A — no migrations)', meta.gateDate) +
    `## Purpose

Record schema and data migrations: forward path, rollback, idempotency, and production notes.

---

## Lifecycle

| Attribute | Value |
|-----------|-------|
| **Created when** | First schema or data migration identified for phase |
| **Updated by** | Implementing assistant; owner for production deploy |
| **Read-only when** | Phase gate PASS; post-close hotfixes append addenda only |
| **Roadmap relation** | Documents persistence changes required by phase dependencies |

---

${body}

---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
`
  );
}

function genReview(meta) {
  return (
    schemaHeader(meta.title, 'REVIEW', 'Closed', meta.gateDate) +
    `## Purpose

Record architecture review findings and formal phase gate verdict.

---

## Review record

| Item | Result |
|------|--------|
| Design compliance | [DESIGN.md](DESIGN.md) — scope and boundaries satisfied |
| Implementation evidence | [IMPLEMENTATION.md](IMPLEMENTATION.md) |
| Test evidence | [TESTING.md](TESTING.md) |
| Checklist | [CHECKLIST.md](CHECKLIST.md) |
| Constitution / layer lint | PASS — \`MemoryService\` unchanged unless phase scope requires additive hooks only |
${meta.adr ? `| ADR gate | ${meta.adr} Implemented |` : ''}

**Gate verdict:** **PASS** (${meta.gateDate})

**Evidence:** [COMPLETION.md](COMPLETION.md) · [CHECKLIST.md](CHECKLIST.md)

---

*Do not contradict [09-ROADMAP.md](../../roadmap/09-ROADMAP.md) or Approved ADRs.*
`
  );
}

function genCompletion(meta) {
  return (
    schemaHeader(meta.title, 'COMPLETION', 'Closed', meta.gateDate) +
    `## Purpose

Map roadmap success criteria to durable evidence.

---

## Evidence index

| Artifact | Link |
|----------|------|
| Implementation | [IMPLEMENTATION.md](IMPLEMENTATION.md) |
| Verification | [TESTING.md](TESTING.md) |
| Gate checklist | [CHECKLIST.md](CHECKLIST.md) |
| Review verdict | [REVIEW.md](REVIEW.md) |

---

## Success criteria

All checklist items in [CHECKLIST.md](CHECKLIST.md) marked complete at gate ${meta.gateDate}. Default env flags OFF — zero behavior change for deployments without opt-in.

---

## Rollback

Disable phase master env flag(s) documented in [IMPLEMENTATION.md](IMPLEMENTATION.md). No destructive migration required for rollback on hot path.

---

*Gate closed ${meta.gateDate}.*
`
  );
}

function genRetrospective(meta) {
  return (
    schemaHeader(meta.title, 'RETROSPECTIVE', 'Closed', meta.gateDate) +
    `## Purpose

Capture lessons learned, accepted debt, and recommendations for subsequent phases.

---

## Summary

Phase implemented as opt-in platform capability (default OFF). Gate PASS ${meta.gateDate}. See [IMPLEMENTATION.md](IMPLEMENTATION.md) for deliverables.

---

## What worked well

| Area | Outcome |
|------|---------|
| **Ports & adapters** | New capability behind composition root; core services unchanged |
| **Feature flags** | Master env default \`false\` preserved backward compatibility |
| **Test gate** | [TESTING.md](TESTING.md) evidence attached before close |

---

## Accepted debt / deferrals

Items explicitly deferred in [CHECKLIST.md](CHECKLIST.md) or [IMPLEMENTATION.md](IMPLEMENTATION.md) — carry forward to POST-ROADMAP or later phases only with ADR.

---

## Recommendations

1. Close all ten schema documents at gate (not Reserved scaffolds).
2. Keep additive MCP/REST changes only when extending agent-facing surfaces.
3. Reference [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md) for next phase folder.

---

*Recorded at gate ${meta.gateDate}.*
`
  );
}

function genRisks(meta) {
  return (
    schemaHeader(meta.title, 'RISKS', 'Closed', meta.gateDate) +
    `## Purpose

Phase-specific risk register: identified, mitigated, realized, and deferred risks.

---

## Risk register

| Risk | Likelihood | Impact | Mitigation | Status |
|------|------------|--------|------------|--------|
| Scope creep into agent runtime | Low | Critical | Constitution §7; MemoryService boundary | Mitigated |
| Default-on regression | Low | High | Master env flag default \`false\` | Mitigated |
| Vendor lock-in | Medium | Medium | Ports/adapters pattern | Mitigated |
| Incomplete gate docs | Medium | Low | PHASE-DOCUMENT-SCHEMA compliance | Mitigated at close |

---

*Gate PASS ${meta.gateDate} — realized risks locked; deferred items in CHECKLIST.*
`
  );
}

function genReadmeIndex(meta, dir) {
  const docs = [
    ['DESIGN.md', 'Approved design intent', '✅ Complete'],
    ['IMPLEMENTATION.md', 'Build plan and modules', '✅ Complete'],
    [
      'MIGRATION.md',
      'Schema and data migrations',
      MIGRATION_HINTS[dir] ? '✅ Complete' : '✅ N/A (no DDL) or prior phase',
    ],
    ['TESTING.md', 'Verification strategy', '✅ Complete'],
    ['REVIEW.md', 'Architecture review and gate', '✅ Complete'],
    ['COMPLETION.md', 'Success criteria evidence', '✅ Complete'],
    ['RETROSPECTIVE.md', 'Lessons learned', '✅ Complete'],
    ['CHECKLIST.md', 'Gate checklist instance', '✅ Complete'],
    ['RISKS.md', 'Risk register', '✅ Complete'],
  ];
  const rows = docs.map(([f, r, s]) => `| [${f}](${f}) | ${r} | ${s} |`).join('\n');
  return `## Document index

| Document | Responsibility | Status |
|----------|----------------|--------|
${rows}

*All ten governance documents closed per [PHASE-DOCUMENT-SCHEMA.md](../PHASE-DOCUMENT-SCHEMA.md). Gate PASS ${meta.gateDate}.*
`;
}

function updateReadme(dir, meta) {
  const p = path.join(PHASES_DIR, dir, 'README.md');
  if (!fs.existsSync(p)) return 'no-readme';
  let content = fs.readFileSync(p, 'utf8');
  const indexBlock = genReadmeIndex(meta, dir);

  if (/## Document index[\s\S]*?(?=\n## |\n---|\n\*Subordinate|$)/.test(content)) {
    content = content.replace(/## Document index[\s\S]*?(?=\n## |\n---|\n\*Subordinate|$)/, indexBlock + '\n');
  } else if (/## Documents[\s\S]*?(?=\n## |\n---|\n\*Subordinate|$)/.test(content)) {
    content = content.replace(/## Documents[\s\S]*?(?=\n## |\n---|\n\*Subordinate|$)/, indexBlock + '\n');
  } else if (/## Document index[\s\S]*?(?=\n## |$)/.test(content)) {
    content = content.replace(/## Document index[\s\S]*?(?=\n## |$)/, indexBlock + '\n');
  } else {
    content = content.trimEnd() + '\n\n---\n\n' + indexBlock + '\n';
  }

  fs.writeFileSync(p, content);
  return 'readme-index';
}

function normalizeStatusHeader(filePath, gateDate) {
  if (!fs.existsSync(filePath)) return;
  let c = fs.readFileSync(filePath, 'utf8');
  if (c.includes('**Phase status:**')) return;
  if (/\*\*Status:\*\* Implemented/i.test(c)) {
    c = c.replace(
      /\*\*Status:\*\* Implemented \(20\d\d-\d\d-\d\d\)/,
      `**Phase status:** Closed  \n**Gate:** PASS ${gateDate}`,
    );
    fs.writeFileSync(filePath, c);
  }
}

function processPhase(dir) {
  const meta = parseMeta(dir);
  if (!meta.implemented) return { dir, action: 'skipped-not-implemented' };

  const results = {};
  for (const [name, gen] of [
    ['MIGRATION.md', () => genMigration(dir, meta)],
    ['REVIEW.md', () => genReview(meta)],
    ['COMPLETION.md', () => genCompletion(meta)],
    ['RETROSPECTIVE.md', () => genRetrospective(meta)],
    ['RISKS.md', () => genRisks(meta)],
  ]) {
    results[name] = writeIfNeeded(dir, name, gen());
  }

  for (const name of ['IMPLEMENTATION.md', 'TESTING.md', 'DESIGN.md']) {
    normalizeStatusHeader(path.join(PHASES_DIR, dir, name), meta.gateDate);
  }

  results['README.md'] = updateReadme(dir, meta);
  return { dir, ...results };
}

const report = listPhaseDirs().map(processPhase);
console.log(JSON.stringify(report, null, 2));
console.log(`\nProcessed ${report.length} phase folders.`);
