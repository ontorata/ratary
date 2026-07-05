/**
 * Benchmark context strategies vs naive full-memory dump.
 * Run: npx tsx scripts/benchmark-context-tokens.ts
 */
import { ContextBuilder } from '../src/memory/context-builder.js';
import { generateSummary } from '../src/knowledge/summary.generator.js';
import { estimateTokens, reductionPercent } from '../src/memory/token-estimate.js';
import type { ScoredMemory } from '../src/memory/ranker.js';
import type { Memory } from '../src/types/memory.js';
import { DEFAULT_CONTEXT_MAX_CHARS } from '../src/memory/context.config.js';

const MEMORY_COUNT = 20;
const CONTENT_CHARS = 2_400;

function makeLongContent(seed: number): string {
  const sections = [
    `# Architecture note ${seed}`,
    '## Context',
    'JWT middleware validates Bearer tokens on every protected route. Refresh rotation uses a single-use family id stored in D1.',
    '## Implementation',
    '```typescript',
    'export async function verifyAccessToken(token: string): Promise<JwtClaims> {',
    '  const claims = jwtService.verify(token);',
    '  if (claims.revoked) throw new ForbiddenError("Token revoked");',
    '  return claims;',
    '}',
    '```',
    '## Pitfalls',
    '- Never log raw tokens',
    '- Scope queries by ownerId to prevent cross-tenant leaks',
    '- Keep summary under 300 chars for MCP import validation',
  ];
  let body = sections.join('\n\n');
  while (body.length < CONTENT_CHARS) {
    body += `\n\n- Detail bullet ${body.length} for memory ${seed}: additional operational guidance and edge cases.`;
  }
  return body.slice(0, CONTENT_CHARS);
}

function makeMemory(index: number): ScoredMemory {
  const content = makeLongContent(index);
  const title = `Handoff pattern ${index} — auth and scope`;
  const memory: Memory = {
    id: `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`,
    codename: `AUTH-${String(index).padStart(4, '0')}`,
    slug: `handoff-${index}`,
    title,
    project: 'ai-brain',
    content,
    summary: generateSummary(content),
    keywords: ['auth', 'jwt'],
    category: 'architecture',
    memoryType: 'note',
    importance: 90 - (index % 15),
    language: 'en',
    notes: '',
    tags: ['handoff'],
    favorite: false,
    archived: false,
    ownerId: 'bench-owner',
    projectId: 'ai-brain',
    level: 'note',
    lastAccessed: null,
    accessCount: 0,
    embeddingId: null,
    objectKey: null,
    semanticHash: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  };
  return { ...memory, relevanceScore: 100 - index };
}

function naiveFullDump(memories: ScoredMemory[]): string {
  return memories
    .map((m) => `# ${m.title} [${m.codename}]\n${m.content}`)
    .join('\n\n---\n\n');
}

function codenameIndex(memories: ScoredMemory[]): string {
  return memories.map((m) => `- ${m.codename}: ${m.title} (importance ${m.importance})`).join('\n');
}

interface Strategy {
  name: string;
  build: (memories: ScoredMemory[]) => string;
}

function runBenchmark(): void {
  const all = Array.from({ length: MEMORY_COUNT }, (_, i) => makeMemory(i + 1));
  const builder = new ContextBuilder();

  const strategies: Strategy[] = [
    {
      name: '1. Naive full dump (all memories, full body)',
      build: (m) => naiveFullDump(m),
    },
    {
      name: '2. ContextBuilder default (12k chars, body truncated)',
      build: (m) => builder.build(m),
    },
    {
      name: '3. Summary-only (12k budget)',
      build: (m) => builder.build(m, { includeSummaryOnly: true, maxChars: DEFAULT_CONTEXT_MAX_CHARS }),
    },
    {
      name: '4. Summary-only (top 5 memories)',
      build: (m) =>
        builder.build(m.slice(0, 5), {
          includeSummaryOnly: true,
          maxChars: DEFAULT_CONTEXT_MAX_CHARS,
        }),
    },
    {
      name: '5. Summary-only + 3k char cap',
      build: (m) => builder.build(m, { includeSummaryOnly: true, maxChars: 3_000 }),
    },
    {
      name: '6. Aggressive body cap (2k chars, truncated bodies)',
      build: (m) => builder.build(m, { maxChars: 2_000 }),
    },
    {
      name: '7. Codename index only (fetch on demand)',
      build: (m) => codenameIndex(m),
    },
  ];

  const baseline = estimateTokens(naiveFullDump(all));
  const rows = strategies.map((s) => {
    const text = s.build(all);
    const tokens = estimateTokens(text);
    return {
      strategy: s.name,
      chars: text.length,
      tokens,
      vsBaseline: reductionPercent(baseline, tokens),
    };
  });

  console.log('\n=== Ratary Context Token Benchmark ===\n');
  console.log(`Fixture: ${MEMORY_COUNT} memories × ~${CONTENT_CHARS} chars body + auto summary (≤300 chars)`);
  console.log(`Baseline (naive dump): ~${baseline.toLocaleString()} tokens\n`);
  console.log('Strategy'.padEnd(52) + 'Chars'.padStart(8) + 'Tokens'.padStart(8) + 'Saved'.padStart(8));
  console.log('-'.repeat(76));
  for (const row of rows) {
    console.log(
      row.strategy.padEnd(52) +
        String(row.chars).padStart(8) +
        String(row.tokens).padStart(8) +
        `${row.vsBaseline}%`.padStart(8),
    );
  }

  const best = rows.reduce((a, b) => (a.vsBaseline > b.vsBaseline ? a : b));
  const hits90 = rows.filter((r) => r.vsBaseline >= 90);
  console.log('\n--- Summary ---');
  console.log(`Best reduction: ${best.vsBaseline}% (${best.strategy})`);
  if (hits90.length > 0) {
    console.log(`Strategies ≥90% savings: ${hits90.map((r) => r.strategy.split('.')[0].trim()).join(', ')}`);
  } else {
    console.log('No built-in strategy reached 90% alone; combine summary-only + lower limit + codename index.');
  }
  console.log('\nNote: estimates use heuristic (chars/words); real tokenizer may differ ±10%.\n');
}

runBenchmark();
