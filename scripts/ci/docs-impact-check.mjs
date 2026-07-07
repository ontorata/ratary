#!/usr/bin/env node
/**
 * Documentation impact CI check (warning phase).
 * Warns when code paths change without docs/README/CHANGELOG updates.
 *
 * Usage: node scripts/ci/docs-impact-check.mjs [baseRef]
 * Default baseRef: origin/main or GITHUB_BASE_REF
 */

import { execSync } from 'node:child_process';

const CODE_PATTERNS = [
  /^src\//,
  /^api\//,
  /^packages\//,
  /^scripts\/(?!ci\/)/,
];

const DOC_PATTERNS = [
  /^docs\//,
  /^README\.md$/i,
  /^CHANGELOG\.md$/i,
  /^\.github\/pull_request_template\.md$/,
  /^openapi/i,
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
  console.log('docs-impact-check: no changed files detected — skip');
  process.exit(0);
}

const codeChanged = files.some((f) => matches(CODE_PATTERNS, f));
const docsChanged = files.some((f) => matches(DOC_PATTERNS, f));

if (!codeChanged) {
  console.log('docs-impact-check: no code paths changed — OK');
  process.exit(0);
}

if (docsChanged) {
  console.log('docs-impact-check: code and documentation both changed — OK');
  process.exit(0);
}

console.warn('');
console.warn('⚠️  DOCUMENTATION IMPACT WARNING');
console.warn('');
console.warn('Code changed under src/, api/, or packages/ but no docs/ README CHANGELOG update detected.');
console.warn('');
console.warn('Before merge, complete Documentation Impact Check per:');
console.warn('  .ai/core/governance/IMPLEMENTATION-COMPLETION-PROTOCOL.md');
console.warn('');
console.warn('Changed code files (sample):');
files.filter((f) => matches(CODE_PATTERNS, f)).slice(0, 15).forEach((f) => console.warn(`  - ${f}`));
console.warn('');
console.warn('This check is warning-only. Enforcement will be enabled later.');
console.warn('');

process.exit(0);
