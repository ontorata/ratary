#!/usr/bin/env node
import { readFileSync, statSync } from 'node:fs';
import { orgMemoryReviewsPath } from '../lib/org-memory-paths.mjs';

const REGISTRY = orgMemoryReviewsPath('production-workload-registry.json');
const METRICS_JSON = orgMemoryReviewsPath('production-metrics.json');

function fail(message) {
  console.error(`\n❌ PRODUCTION METRICS CHECK FAILED\n\n${message}\n`);
  process.exit(1);
}

try {
  statSync(REGISTRY);
} catch {
  fail(`Missing registry: ${REGISTRY}`);
}

let registry;
try {
  registry = JSON.parse(readFileSync(REGISTRY, 'utf8'));
} catch (error) {
  fail(`Cannot parse registry: ${error.message}`);
}

if (!Array.isArray(registry.organizations) || registry.organizations.length === 0) {
  fail('Registry must include at least one organization');
}

if (!Array.isArray(registry.workloads) || registry.workloads.length === 0) {
  fail('Registry must include at least one workload');
}

try {
  statSync(METRICS_JSON);
} catch {
  fail(`Missing metrics snapshot — run npm run metrics:production (${METRICS_JSON})`);
}

let metrics;
try {
  metrics = JSON.parse(readFileSync(METRICS_JSON, 'utf8'));
} catch (error) {
  fail(`Cannot parse metrics JSON: ${error.message}`);
}

for (const key of ['productionOrganizations', 'productionWorkloads', 'schemaVersion']) {
  if (metrics[key] === undefined) {
    fail(`Metrics JSON missing required field: ${key}`);
  }
}

console.log('production-metrics-check: registry + snapshot present — OK');
