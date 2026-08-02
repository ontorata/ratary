import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { docsAiRoot, orgMemoryReviewsRoot, usesKnowledgeOsLayout } from './org-memory-paths.js';

describe('org-memory-paths', () => {
  it('resolves docs-ai sibling when present', () => {
    const sibling = resolve(process.cwd(), '../docs-ai');
    if (!existsSync(sibling)) {
      expect(usesKnowledgeOsLayout()).toBe(false);
      return;
    }
    expect(usesKnowledgeOsLayout()).toBe(true);
    expect(docsAiRoot()).toBe(sibling);
    expect(orgMemoryReviewsRoot()).toBe(resolve(sibling, 'reviews/org-memory-dogfood'));
  });
});
