#!/usr/bin/env node
/**
 * Permission contract CI check — validates canonical permission strings
 * in permission-context.ts match the locked security invariant.
 *
 * When permission-related auth paths change, also requires ADR signal in diff.
 *
 * Usage: node scripts/ci/permission-contract-check.mjs [baseRef]
 */

import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

/** Locked contract — must match PERMISSION-CONTRACT.md and ADR-0003 */
const CANONICAL_PERMISSIONS = [
  'memory.read',
  'memory.write',
  'workspace.read',
  'workspace.manage',
  'organization.manage',
];

const PERMISSION_SOURCE = 'src/auth/permission-context.ts';
const PERMISSION_TRIGGER_PATTERNS = [
  /^src\/auth\/permission-context\.ts$/,
  /^src\/auth\/authorization-boundary\.ts$/,
  /^src\/auth\/permission\.middleware\.ts$/,
  /^src\/auth\/permissions\.ts$/,
];

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

function extractPermissionsFromSource() {
  const content = readFileSync(PERMISSION_SOURCE, 'utf8');
  const blockMatch = content.match(
    /export const PERMISSIONS = \{[\s\S]*?\} as const;/,
  );
  if (!blockMatch) {
    throw new Error(`Could not parse PERMISSIONS block in ${PERMISSION_SOURCE}`);
  }
  const literals = [...blockMatch[0].matchAll(/:\s*'([^']+)'/g)].map((m) => m[1]);
  return [...new Set(literals)].sort();
}

function validateContract() {
  const fromSource = extractPermissionsFromSource();
  const expected = [...CANONICAL_PERMISSIONS].sort();

  if (fromSource.length !== expected.length) {
    return {
      ok: false,
      reason: `Permission count mismatch: source has ${fromSource.length}, contract requires ${expected.length}`,
      fromSource,
      expected,
    };
  }

  for (let i = 0; i < expected.length; i++) {
    if (fromSource[i] !== expected[i]) {
      return {
        ok: false,
        reason: `Permission mismatch at index ${i}: source="${fromSource[i]}" expected="${expected[i]}"`,
        fromSource,
        expected,
      };
    }
  }

  return { ok: true, fromSource, expected };
}

const baseRef =
  process.argv[2] ||
  process.env.GITHUB_BASE_REF ||
  'origin/main';

const contract = validateContract();
if (!contract.ok) {
  console.error('');
  console.error('❌ PERMISSION CONTRACT CHECK FAILED');
  console.error('');
  console.error(contract.reason);
  console.error('');
  console.error('Canonical permissions:', CANONICAL_PERMISSIONS.join(', '));
  console.error('Source permissions:', contract.fromSource?.join(', '));
  console.error('');
  console.error('Amend ADR-0003 and .ai/core/governance/PERMISSION-CONTRACT.md before changing permissions.');
  console.error('');
  process.exit(1);
}

console.log('permission-contract-check: runtime PERMISSIONS match canonical contract — OK');

const files = getChangedFiles(baseRef);
const permissionTouched = files.filter((f) => matches(PERMISSION_TRIGGER_PATTERNS, f));

if (permissionTouched.length === 0) {
  console.log('permission-contract-check: no permission trigger files changed — OK');
  process.exit(0);
}

const adrSignalPresent = files.some((f) => matches(ADR_SIGNAL_PATTERNS, f));
if (!adrSignalPresent) {
  console.error('');
  console.error('❌ PERMISSION CONTRACT CHECK FAILED');
  console.error('');
  console.error('Permission-related auth files changed without ADR decision record in diff.');
  console.error('');
  console.error('Trigger files:');
  permissionTouched.forEach((f) => console.error(`  - ${f}`));
  console.error('');
  console.error('Add ADR amendment (ADR-0003) or reference in .ai/core/architecture/');
  console.error('');
  process.exit(1);
}

console.log('permission-contract-check: permission paths changed with ADR signal — OK');
process.exit(0);
