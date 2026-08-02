import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

export function repoRoot(): string {
  return resolve(process.cwd());
}

/** Knowledge OS root — sibling docs-ai or legacy .ai inside repo. */
export function docsAiRoot(): string {
  if (process.env.DOCS_AI_ROOT) {
    return resolve(process.env.DOCS_AI_ROOT);
  }
  const sibling = resolve(repoRoot(), '../docs-ai');
  if (existsSync(sibling)) {
    return sibling;
  }
  return resolve(repoRoot(), '.ai');
}

export function orgMemoryReviewsRoot(): string {
  const knowledgeOs = resolve(docsAiRoot(), 'reviews/org-memory-dogfood');
  if (existsSync(knowledgeOs)) {
    return knowledgeOs;
  }
  return resolve(repoRoot(), '.ai/reviews/org-memory-dogfood');
}

export function orgMemoryReviewsPath(...segments: string[]): string {
  return resolve(orgMemoryReviewsRoot(), ...segments);
}

export function usesKnowledgeOsLayout(): boolean {
  if (process.env.DOCS_AI_ROOT) {
    return true;
  }
  return existsSync(resolve(repoRoot(), '../docs-ai'));
}
