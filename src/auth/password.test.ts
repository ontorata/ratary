import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from './password.js';

describe('password', () => {
  it('hashes and verifies peppered passwords (v2)', () => {
    const hash = hashPassword('studio-secret-99');
    expect(hash.startsWith('scrypt-v2$')).toBe(true);
    expect(verifyPassword('studio-secret-99', hash)).toBe(true);
    expect(verifyPassword('wrong', hash)).toBe(false);
  });
});
