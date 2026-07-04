#!/usr/bin/env node
/**
 * Audit phase governance docs under .ai/phases for common gaps.
 * Run: node scripts/audit-phase-governance.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const PHASES_DIR = path.join(ROOT, '.ai', 'phases');

const SKIP_DIRS = new Set(['roadmap', 'audits']);
const DOCS = [
  'README',
  'DESIGN',
  'IMPLEMENTATION',
  'MIGRATION',
  'TESTING',
  'REVIEW',
  'COMPLETION',
  'RETROSPECTIVE',
  'CHECKLIST',
  'RISKS',
];

const dirs = fs
  .readdirSync(PHASES_DIR)
  .filter((d) => {
    const p = path.join(PHASES_DIR, d);
    return fs.statSync(p).isDirectory() && !SKIP_DIRS.has(d);
  })
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

const issues = [];

function bodyAfterHeading(content, heading) {
  const idx = content.indexOf(heading);
  if (idx === -1) return null;
  const rest = content.slice(idx + heading.length);
  const match = rest.match(/^\s*\n([\s\S]*?)(?=\n## |\n### |\n---|\n\*|$)/);
  return match ? match[1].trim() : '';
}

for (const dir of dirs) {
  for (const doc of DOCS) {
    const file = path.join(PHASES_DIR, dir, `${doc}.md`);
    if (!fs.existsSync(file)) {
      issues.push({ phase: dir, doc, issue: 'MISSING' });
      continue;
    }
    const content = fs.readFileSync(file, 'utf8');

    if (doc === 'COMPLETION') {
      const hasSc =
        content.includes('| SC-') ||
        content.includes('| Criterion |') ||
        content.includes('Success criteria evidence') ||
        content.includes('Success Criteria Evidence') ||
        content.includes('## Deliverables') ||
        content.includes('### Code');
      if (!hasSc) issues.push({ phase: dir, doc, issue: 'no success criteria table' });
      if (content.includes('**Gate:** PASS') && !content.includes('✅ Closed — gate PASS')) {
        issues.push({ phase: dir, doc, issue: 'legacy Gate: header (two-line)' });
      }
    }

    if (doc === 'RETROSPECTIVE') {
      const worked =
        bodyAfterHeading(content, '## What worked well') ||
        bodyAfterHeading(content, '## What went well') ||
        bodyAfterHeading(content, '### What worked') ||
        bodyAfterHeading(content, '## What Went Well');
      const summary = bodyAfterHeading(content, '## Summary');
      const hasLessons = content.includes('- ') && content.split('\n').filter((l) => l.startsWith('- ')).length >= 2;
      if (!worked && !summary && !hasLessons && content.length < 600) {
        issues.push({ phase: dir, doc, issue: 'empty or scaffold only' });
      }
      const gateMatches = content.match(/Gate PASS/g);
      if (gateMatches && gateMatches.length > 2) {
        issues.push({ phase: dir, doc, issue: `duplicate Gate PASS (${gateMatches.length}x)` });
      }
    }

    if (doc === 'REVIEW') {
      if (!/PASS|FAIL|Verdict|verdict/i.test(content)) {
        issues.push({ phase: dir, doc, issue: 'no gate verdict keyword' });
      }
    }
  }
}

const byIssue = {};
for (const i of issues) byIssue[i.issue] = (byIssue[i.issue] || 0) + 1;

console.log(`Phases audited: ${dirs.length}`);
console.log(`Issues found: ${issues.length}\n`);
console.log('By type:');
for (const [k, v] of Object.entries(byIssue).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${v}\t${k}`);
}
console.log('\nDetails:');
for (const i of issues.sort(
  (a, b) => a.phase.localeCompare(b.phase, undefined, { numeric: true }) || a.doc.localeCompare(b.doc),
)) {
  console.log(`  ${i.phase}/${i.doc}: ${i.issue}`);
}

process.exit(issues.length > 0 ? 1 : 0);
