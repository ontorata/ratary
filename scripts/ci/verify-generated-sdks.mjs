#!/usr/bin/env node
/**
 * Verify OpenAPI-generated SDKs match committed output, ignoring volatile timestamps.
 */
import { execSync } from 'node:child_process';

const PATHS = [
  'packages/sdk-go/generated',
  'packages/sdk-python/generated',
  'packages/sdk-java/generated',
  'packages/sdk-rust/generated',
  'packages/sdk-csharp/generated',
  'packages/sdk-php/generated',
];

function normalizeDiff(text) {
  return text
    .split('\n')
    .filter((line) => {
      if (!line.startsWith('+') && !line.startsWith('-')) return true;
      const body = line.slice(1);
      if (/date\s*=/.test(body)) return false;
      if (/Generated on:/i.test(body)) return false;
      if (/User-Agent:/i.test(body)) return false;
      if (/^\+{3}|^-{3}|^\\|^@/.test(line)) return true;
      return true;
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

let rawDiff = '';
try {
  rawDiff = execSync(`git diff -- ${PATHS.join(' ')}`, { encoding: 'utf8' });
} catch (error) {
  const stdout = error.stdout?.toString?.() ?? '';
  const stderr = error.stderr?.toString?.() ?? '';
  rawDiff = stdout || stderr;
}

const meaningful = normalizeDiff(rawDiff).replace(/^[+\-]\s*$/gm, '').trim();

if (meaningful.length > 0) {
  console.error('Generated SDK drift detected (after ignoring timestamps):\n');
  console.error(meaningful.slice(0, 8000));
  process.exit(1);
}

console.log('verify-generated-sdks: OK (no meaningful drift)');
