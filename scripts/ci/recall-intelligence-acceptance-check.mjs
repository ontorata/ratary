#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const ACCEPTANCE_MANIFEST = '.ai/reviews/org-memory-dogfood/P1-C-ACCEPTANCE.md';
const EVAL_LOG = '.ai/reviews/org-memory-dogfood/recall-intelligence-log.md';

function fail(message) {
  console.error(`\n❌ RECALL INTELLIGENCE ACCEPTANCE CHECK FAILED\n\n${message}\n`);
  process.exit(1);
}

let manifest = '';
let evalLog = '';
try {
  manifest = readFileSync(ACCEPTANCE_MANIFEST, 'utf8');
} catch (error) {
  fail(`Cannot read ${ACCEPTANCE_MANIFEST}: ${error.message}`);
}
try {
  evalLog = readFileSync(EVAL_LOG, 'utf8');
} catch (error) {
  fail(`Cannot read ${EVAL_LOG}: ${error.message}`);
}

const requiredPass = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7'];
for (const gate of requiredPass) {
  const gatePass = new RegExp(`\\|\\s*${gate}\\s*\\|\\s*PASS\\s*\\|`, 'i');
  if (!gatePass.test(manifest)) {
    fail(`Gate ${gate} is not PASS in ${ACCEPTANCE_MANIFEST}`);
  }
}

if (!/\| \*\*Status\*\* \| (PASS|READY|COMPLETE|CLOSED)/i.test(manifest)) {
  fail('Manifest status is not marked PASS/READY/COMPLETE/CLOSED');
}

if (!/isolation_failures:\s*0/.test(evalLog)) {
  fail('Latest evaluation log must report isolation_failures=0');
}

if (!/candidate_set_hash:/.test(evalLog)) {
  fail('Evaluation log must include candidate_set_hash');
}

console.log('recall-intelligence-acceptance-check: all G1-G7 gates are PASS — OK');
