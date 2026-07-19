#!/usr/bin/env node
import { readFileSync, statSync } from 'node:fs';

const INGESTION_LOG = '.ai/reviews/org-memory-dogfood/ingestion-log.md';
const USAGE_LOG = '.ai/reviews/org-memory-dogfood/operational-usage-log.md';
const METRICS_JSON = '.ai/reviews/org-memory-dogfood/operational-metrics.json';
const CHECKPOINTS = '.ai/reviews/org-memory-dogfood/operational-checkpoints.md';
const ACCEPTANCE = '.ai/reviews/org-memory-dogfood/P1-E-ACCEPTANCE.md';
const RUNWAY = '.ai/reviews/org-memory-dogfood/OPERATIONAL-RUNWAY.md';

function fail(message) {
  console.error(`\n❌ OPERATIONAL PROOF ACCEPTANCE CHECK FAILED\n\n${message}\n`);
  process.exit(1);
}

function read(path) {
  try {
    return readFileSync(path, 'utf8');
  } catch (error) {
    fail(`Cannot read ${path}: ${error.message}`);
  }
}

function latestIngestionBlock(content) {
  const matches = [...content.matchAll(/## run_id=([a-f0-9-]+)/g)];
  if (matches.length === 0) fail(`No ingestion runs found in ${INGESTION_LOG}`);
  const latest = matches[matches.length - 1];
  const start = latest.index ?? 0;
  const end = content.indexOf('\n## ', start + 1);
  return content.slice(start, end === -1 ? content.length : end);
}

const ingestion = read(INGESTION_LOG);
const latest = latestIngestionBlock(ingestion);
const failedMatch = latest.match(/- failed=(\d+)/);
const failed = failedMatch ? Number(failedMatch[1]) : NaN;
if (!Number.isFinite(failed) || failed !== 0) {
  fail(`Latest ingestion run failed=${failed} — expected failed=0 (E1)`);
}

const usage = read(USAGE_LOG);
if (!/schema_version=1\.0/.test(usage)) {
  fail(`${USAGE_LOG} missing schema_version=1.0 (E2)`);
}

try {
  statSync(METRICS_JSON);
} catch {
  fail(`${METRICS_JSON} missing — run npm run metrics:operational-proof (E3)`);
}

try {
  statSync(CHECKPOINTS);
} catch {
  fail(`${CHECKPOINTS} missing — run npm run checkpoint:operational-proof (E4)`);
}

if (!/\| E1 \|/.test(read(ACCEPTANCE))) {
  fail(`${ACCEPTANCE} missing E1 row (E7)`);
}

if (!/30-day/.test(read(RUNWAY))) {
  fail(`${RUNWAY} missing 30-day procedure (E8)`);
}

console.log('operational-proof-acceptance-check: E1–E4 artifacts present — OK');
