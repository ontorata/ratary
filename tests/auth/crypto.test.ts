import { describe, it, expect } from 'vitest';
import { hashSecret, generateApiKeyPlaintext, isApiKeyFormat, timingSafeCompareHash } from '../../src/auth/crypto.js';

describe('auth crypto', () => {
  it('should generate api key with aic_ prefix', () => {
    const key = generateApiKeyPlaintext();
    expect(isApiKeyFormat(key)).toBe(true);
    expect(key.startsWith('aic_')).toBe(true);
  });

  it('should produce stable HMAC hash', () => {
    const key = 'aic_test123';
    expect(hashSecret(key)).toBe(hashSecret(key));
    expect(hashSecret(key)).not.toBe(hashSecret('aic_other'));
  });

  it('should compare hashes safely', () => {
    const a = hashSecret('aic_a');
    const b = hashSecret('aic_a');
    const c = hashSecret('aic_b');
    expect(timingSafeCompareHash(a, b)).toBe(true);
    expect(timingSafeCompareHash(a, c)).toBe(false);
  });
});
