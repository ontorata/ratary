/**
 * D4 protection lattice (owner decision 2026-07-19).
 *
 * A memory is protected from decay archival when ANY criterion matches:
 * - `favorite === true`
 * - `importance >= 90`
 * - a governance tag is present
 *
 * `handoff` is deliberately NOT auto-protected: handoffs are often transient
 * and only survive through the criteria above or the retention window.
 */

export const GOVERNANCE_PROTECTED_TAGS = ['governance', 'adr', 'architecture', 'baseline'] as const;

export const CORE_IMPORTANCE_THRESHOLD = 90;

export interface ProtectionInput {
  readonly favorite: boolean;
  /** 0–100 */
  readonly importance: number;
  readonly tags: readonly string[];
}

export function isProtectedMemory(input: ProtectionInput): boolean {
  if (input.favorite) return true;
  if (input.importance >= CORE_IMPORTANCE_THRESHOLD) return true;
  const normalized = input.tags.map((tag) => tag.toLowerCase());
  return GOVERNANCE_PROTECTED_TAGS.some((tag) => normalized.includes(tag));
}
