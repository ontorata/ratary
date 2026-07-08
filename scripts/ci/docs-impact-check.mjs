#!/usr/bin/env node
/**
 * Documentation / governance impact CI check.
 *
 * Fails when code paths change without documentation or .ai governance updates.
 *
 * Usage: node scripts/ci/docs-impact-check.mjs [baseRef] [--warn]
 * Default: fail mode (exit 1). Pass --warn for warning-only (legacy).
 */

import { execSync } from 'node:child_process';

const CODE_PATTERNS = [
  /^src\//,
  /^api\//,
  /^packages\//,
  /^scripts\/(?!ci\/)/,
];

/** Documentation + governance evidence paths */
const GOVERNANCE_DOC_PATTERNS = [
  /^docs\//,
  /^\.ai\//,
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

const warnOnly = process.argv.includes('--warn');
const baseRef =
  process.argv.find((a) => !a.startsWith('-') && a !== process.argv[1]) ||
  process.env.GITHUB_BASE_REF ||
  'origin/main';

const files = getChangedFiles(baseRef);

if (files.length === 0) {
  console.log('docs-impact-check: no changed files detected — skip');
  process.exit(0);
}

const codeChanged = files.some((f) => matches(CODE_PATTERNS, f));
const governanceDocsChanged = files.some((f) => matches(GOVERNANCE_DOC_PATTERNS, f));

if (!codeChanged) {
  console.log('docs-impact-check: no code paths changed — OK');
  process.exit(0);
}

if (governanceDocsChanged) {
  console.log('docs-impact-check: code and governance/documentation evidence both changed — OK');
  process.exit(0);
}

const message = `
❌ DOCUMENTATION / GOVERNANCE IMPACT CHECK FAILED

Code changed under src/, api/, packages/, or scripts/ but no docs/ or .ai/ governance update detected.

Before merge:
  1. Complete Documentation Impact Check per IMPLEMENTATION-COMPLETION-PROTOCOL.md
  2. Update docs/ and/or .ai/ (ADR · evidence · acceptance · governance)
  3. Link ADR when architecture paths changed

Changed code files (sample):
${files
  .filter((f) => matches(CODE_PATTERNS, f))
  .slice(0, 15)
  .map((f) => `  - ${f}`)
  .join('\n')}
`;

if (warnOnly) {
  console.warn(message);
  console.warn('docs-impact-check: warning-only mode — not failing');
  process.exit(0);
}

console.error(message);
process.exit(1);
