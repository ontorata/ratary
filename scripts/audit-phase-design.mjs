#!/usr/bin/env node
/**
 * Audit DESIGN.md across all phase folders.
 * Run: node scripts/audit-phase-design.mjs
 * JSON: node scripts/audit-phase-design.mjs --json
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const PHASES_DIR = path.join(ROOT, '.ai', 'phases');
const SKIP_DIRS = new Set(['roadmap', 'audits']);
const jsonOut = process.argv.includes('--json');

const dirs = fs
  .readdirSync(PHASES_DIR)
  .filter((d) => {
    const p = path.join(PHASES_DIR, d);
    return fs.statSync(p).isDirectory() && !SKIP_DIRS.has(d);
  })
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

function bodyAfter(content, re) {
  const m = content.match(re);
  if (!m) return null;
  const rest = content.slice(m.index + m[0].length);
  const block = rest.match(/^\s*\n([\s\S]*?)(?=\n## |\n---|\n\*Do not|$)/);
  return block ? block[1].trim() : '';
}

function hasSection(content, patterns) {
  return patterns.some((p) => (typeof p === 'string' ? content.includes(p) : p.test(content)));
}

function classifyHeader(content) {
  if (/✅ Closed — gate PASS|✅ Gate PASS|Implemented \(/.test(content.slice(0, 800))) return 'inline';
  if (/^\*\*Gate:\*\* PASS/m.test(content)) return 'legacy-two-line';
  if (/^\*\*Phase status:\*\* Closed/m.test(content) && !/^\*\*Gate:\*\*/m.test(content)) return 'status-only';
  return 'other';
}

function classifyTier(content, lines) {
  if (lines > 200 || /## 1\.|Architecture Analysis|Authority chain/.test(content)) return 'rich';
  if (
    content.includes('Summarize approved boundaries') ||
    content.includes('Record approved design intent: boundaries, ports, ADR links, and non-goals') ||
    (content.includes('## Purpose') && !content.includes('## Boundaries') && !content.includes('## Non-goals'))
  ) {
    return 'scaffold';
  }
  if (content.includes('## Lifecycle') && content.includes('## Boundaries') && content.includes('## Non-goals')) {
    return 'classic';
  }
  if (content.includes('## Design record') || content.includes('**ADR:**')) return 'medium';
  return 'mixed';
}

const results = [];

for (const dir of dirs) {
  const file = path.join(PHASES_DIR, dir, 'DESIGN.md');
  const row = {
    phase: dir,
    exists: fs.existsSync(file),
    lines: 0,
    tier: 'missing',
    header: 'missing',
    issues: [],
    has: {},
  };

  if (!row.exists) {
    row.issues.push('MISSING');
    results.push(row);
    continue;
  }

  const content = fs.readFileSync(file, 'utf8');
  row.lines = content.split('\n').length;
  row.header = classifyHeader(content);
  row.tier = classifyTier(content, row.lines);

  row.has = {
    purpose: hasSection(content, [/## Purpose/i, /## 1\. Purpose/i]),
    boundaries: hasSection(content, [/## Boundaries/i, /### Boundaries/i, /boundary/i]),
    nonGoals: hasSection(content, [/## Non-goals/i, /## Non-Goals/i, /non-goal/i]),
    adr: /ADR-\d+|docs\/adr\//i.test(content),
    ports: hasSection(content, [/## Ports/i, /Port extension/i, /\| Port /i]),
    architecture: hasSection(content, [/## Architecture/i, /```mermaid/i, /flowchart/i]),
    lifecycle: content.includes('## Lifecycle'),
    schema: content.includes('PHASE-DOCUMENT-SCHEMA'),
    archive: /docs\/archive\//.test(content),
    implementationLeak: /\bcommit sequence\b|\bFile map\b|src\/[a-z].*\.ts.*\|.*✅/i.test(content),
  };

  if (!row.has.purpose) row.issues.push('no Purpose section');
  if (!row.has.boundaries && row.tier !== 'rich') row.issues.push('no Boundaries');
  if (!row.has.nonGoals && row.tier !== 'rich') row.issues.push('no Non-goals');
  if (row.header === 'legacy-two-line') row.issues.push('legacy header (Closed + Gate: line)');
  if (row.tier === 'scaffold') row.issues.push('generic scaffold');
  if (row.lines < 25 && row.tier !== 'rich') row.issues.push('very short (<25 lines)');
  if (row.has.implementationLeak) row.issues.push('possible implementation leak in DESIGN');

  results.push(row);
}

const summary = {
  phases: dirs.length,
  withDesign: results.filter((r) => r.exists).length,
  missing: results.filter((r) => !r.exists).map((r) => r.phase),
  byTier: {},
  byHeader: {},
  issueCounts: {},
};

for (const r of results) {
  summary.byTier[r.tier] = (summary.byTier[r.tier] || 0) + 1;
  summary.byHeader[r.header] = (summary.byHeader[r.header] || 0) + 1;
  for (const i of r.issues) summary.issueCounts[i] = (summary.issueCounts[i] || 0) + 1;
}

if (jsonOut) {
  console.log(JSON.stringify({ summary, results }, null, 2));
  process.exit(summary.missing.length || Object.keys(summary.issueCounts).length ? 1 : 0);
}

console.log(`DESIGN audit — ${summary.phases} phase folders\n`);
console.log(`Present: ${summary.withDesign}/${summary.phases}`);
if (summary.missing.length) console.log(`Missing: ${summary.missing.join(', ')}\n`);

console.log('By tier:');
for (const [k, v] of Object.entries(summary.byTier).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${v}\t${k}`);
}

console.log('\nBy header format:');
for (const [k, v] of Object.entries(summary.byHeader).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${v}\t${k}`);
}

console.log('\nIssue counts:');
for (const [k, v] of Object.entries(summary.issueCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${v}\t${k}`);
}

console.log('\nPer phase:');
console.log('Phase'.padEnd(36) + 'Tier'.padEnd(10) + 'Hdr'.padEnd(8) + 'Ln'.padEnd(6) + 'Issues');
console.log('-'.repeat(90));
for (const r of results) {
  const iss = r.issues.length ? r.issues.join('; ') : 'OK';
  console.log(
    `${r.phase.padEnd(36)}${r.tier.padEnd(10)}${r.header.padEnd(8)}${String(r.lines).padEnd(6)}${iss}`,
  );
}

const blockers = results.filter((r) => r.issues.some((i) => i === 'MISSING' || i === 'generic scaffold' || i === 'very short (<25 lines)'));
console.log(`\nBlockers: ${blockers.length}`);
process.exit(blockers.length ? 1 : 0);
