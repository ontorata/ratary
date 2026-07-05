#!/usr/bin/env node
/**
 * One-shot rebrand: AI Brain / AI Memory Cloud → Ratary (Ontorata).
 * Excludes node_modules, dist, lockfiles, and binary assets.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', 'coverage']);
const SKIP_FILES = new Set(['package-lock.json', 'rebrand-ratary.mjs']);
const TEXT_EXT = new Set([
  '.ts', '.tsx', '.js', '.mjs', '.cjs', '.json', '.md', '.mdc', '.yaml', '.yml',
  '.html', '.toml', '.proto', '.rego', '.example', '.env', '.txt',
]);

/** Longest-first to avoid partial replacements. */
const REPLACEMENTS = [
  ['AI Memory Cloud', 'Ratary'],
  ['AI-Brain Memory Cloud', 'Ratary'],
  ['AI Brain Memory Cloud', 'Ratary'],
  ['AI-Brain OS', 'Ratary OS'],
  ['AI Brain OS', 'Ratary OS'],
  ['AI-Brain', 'Ratary'],
  ['AI Brain', 'Ratary'],
  ['@ai-brain/', '@ratary/'],
  ['ai-brain-mcp', 'ratary-mcp'],
  ['ai-memory-cloud', 'ratary'],
  ['ai_brain_sdk', 'ratary_sdk'],
  ['ai_brain', 'ratary'],
  ['ai-brain-v1', 'ratary-v1'],
  ['ai/brain/v1', 'ontorata/ratary/v1'],
  ['ai.brain.v1', 'ontorata.ratary.v1'],
  ['AI_BRAIN_PLATFORM_EDITION', 'RATARY_PLATFORM_EDITION'],
  ['AI_BRAIN_PLATFORM_ENABLED', 'RATARY_PLATFORM_ENABLED'],
  ['lutfi04/ai-brain', 'ontorata/ratary'],
  ['https://github.com/ontorata/ratary', 'https://github.com/ontorata/ratary'],
];

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (SKIP_DIRS.has(name)) continue;
    const stat = statSync(path);
    if (stat.isDirectory()) {
      walk(path, files);
      continue;
    }
    if (SKIP_FILES.has(name)) continue;
    const ext = extname(name);
    if (!TEXT_EXT.has(ext) && !name.endsWith('.example') && name !== '.env.example') continue;
    files.push(path);
  }
  return files;
}

function rebrandContent(content) {
  let out = content;
  for (const [from, to] of REPLACEMENTS) {
    out = out.split(from).join(to);
  }
  return out;
}

let changed = 0;
for (const file of walk(ROOT)) {
  const before = readFileSync(file, 'utf8');
  const after = rebrandContent(before);
  if (after !== before) {
    writeFileSync(file, after, 'utf8');
    changed++;
  }
}

console.log(`Rebrand complete: ${changed} files updated.`);
