import { describe, it, expect } from 'vitest';
import { translateQuestionMarkPlaceholders } from '../../src/infrastructure/_shared/sql-placeholders.js';

describe('translateQuestionMarkPlaceholders', () => {
  it('should map question marks to numbered postgres placeholders', () => {
    expect(
      translateQuestionMarkPlaceholders('SELECT * FROM memories WHERE owner_id = ? AND id = ?'),
    ).toBe('SELECT * FROM memories WHERE owner_id = $1 AND id = $2');
  });

  it('should leave sql without placeholders unchanged', () => {
    expect(translateQuestionMarkPlaceholders('SELECT 1')).toBe('SELECT 1');
  });
});
