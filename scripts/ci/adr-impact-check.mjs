#!/usr/bin/env node
/**
 * ADR impact CI check — fails when architecture-boundary paths change
 * without an ADR decision record in the same diff.
 *
 * Usage: node scripts/ci/adr-impact-check.mjs [baseRef]
 * Default baseRef: origin/main or GITHUB_BASE_REF
 */

import { execSync } from 'node:child_process';

/** Paths that affect identity / tenant / permission / transport boundaries */
const ARCHITECTURE_TRIGGER_PATTERNS = [
  /^src\/auth\//,
  /^src\/scope\//,
  /^src\/transport\/shared\//,
  /^src\/transport\/mcp\/remote\//,
  /^src\/db\/migrations\.ts$/,
  /^schema\.sql$/,
  /^tests\/identity\//,
];

/** Acceptable ADR / governance signals in the same PR */
const ADR_SIGNAL_PATTERNS = [
  /^\.ai\/core\/architecture\/ADR-/,
  /^\.ai\/core\/adr\/ADR-/,
  /^docs\/architecture\/governance\/adr-index\.md$/,
];

function run(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
}

function getChangedFiles(baseRef) {
  try {
    const out = run(`git diff --name-only ${baseRef}...HEAD`);
    return out ? out.split('\n').filter(Boolean) : [];
  } catch {
    try {
      const out = run('git diff --name-only HEAD~1 HEAD');
      return out ? out.split('\n').filter(Boolean) : [];
    } catch {
      return [];
    }
  }
}

function matches(patterns, file) {
  return patterns.some((p) => p.test(file));
}

const baseRef =
  process.argv[2] ||
  process.env.GITHUB_BASE_REF ||
  'origin/main';

const files = getChangedFiles(baseRef);

if (files.length === 0) {
  console.log('adr-impact-check: no changed files detected — skip');
  process.exit(0);
}

const architectureTouched = files.filter((f) => matches(ARCHITECTURE_TRIGGER_PATTERNS, f));
const adrSignalPresent = files.some((f) => matches(ADR_SIGNAL_PATTERNS, f));

if (architectureTouched.length === 0) {
  console.log('adr-impact-check: no architecture-boundary paths changed — OK');
  process.exit(0);
}

if (adrSignalPresent) {
  console.log('adr-impact-check: architecture paths changed with ADR signal in diff — OK');
  process.exit(0);
}

console.error('');
console.error('❌ ADR IMPACT CHECK FAILED');
console.error('');
console.error('Architecture-boundary paths changed without ADR decision record in this diff.');
console.error('');
console.error('Amend or add ADR under .ai/core/architecture/ (ADR-0001–0004) or .ai/core/adr/');
console.error('See .ai/core/governance/ARCHITECTURE-CHANGE-MAP.md');
console.error('');
console.error('Trigger paths changed:');
architectureTouched.slice(0, 20).forEach((f) => console.error(`  - ${f}`));
console.error('');

process.exit(1);
