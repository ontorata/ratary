import { describe, it, expect } from 'vitest';
import { slugify, withSlugSuffix } from '../../src/knowledge/slug.generator.js';

describe('SlugGenerator', () => {
  it('should slugify title', () => {
    expect(slugify('Fastify Auth Middleware')).toBe('fastify-auth-middleware');
    expect(slugify('  Hello World!  ')).toBe('hello-world');
  });

  it('should handle empty title', () => {
    expect(slugify('!!!')).toBe('memory');
  });

  it('should append suffix on collision', () => {
    expect(withSlugSuffix('fastify-auth', 2)).toBe('fastify-auth-2');
  });
});
