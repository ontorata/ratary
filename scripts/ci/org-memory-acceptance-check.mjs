#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const ACCEPTANCE_MANIFEST = '.ai/reviews/org-memory-dogfood/P1-A-ACCEPTANCE.md';

function fail(message) {
  console.error(`\n❌ ORG MEMORY ACCEPTANCE CHECK FAILED\n\n${message}\n`);
  process.exit(1);
}

let content = '';
try {
  content = readFileSync(ACCEPTANCE_MANIFEST, 'utf8');
} catch (error) {
  fail(`Cannot read ${ACCEPTANCE_MANIFEST}: ${error.message}`);
}

const requiredPass = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6'];
for (const gate of requiredPass) {
  const gatePass = new RegExp(`\\|\\s*${gate}\\s*\\|\\s*PASS\\s*\\|`, 'i');
  if (!gatePass.test(content)) {
    fail(`Gate ${gate} is not PASS in ${ACCEPTANCE_MANIFEST}`);
  }
}

if (!/\| \*\*Status\*\* \| (PASS|READY|COMPLETE)/i.test(content)) {
  fail('Manifest status is not marked PASS/READY/COMPLETE');
}

console.log('org-memory-acceptance-check: all G1-G6 gates are PASS — OK');
