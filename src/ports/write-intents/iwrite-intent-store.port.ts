/**
 * PI-C — idempotent write semantics (ADR-067).
 *
 * A write intent records the claim "request X by owner Y creates resource Z".
 * The (owner_id, request_id) PRIMARY KEY is the synchronization point:
 * `claim()` performs a bare INSERT and converts a key violation into the
 * existing mapping — never `exists()` then `insert()` (owner decision C7).
 *
 * Invariant: `resourceId` is the canonical identifier allocated exactly once
 * per (ownerId, requestId). All retries MUST reuse it and never allocate a
 * new one.
 */

export type WriteIntentOperation = 'create';
export type WriteIntentStatus = 'claimed' | 'completed';

export interface WriteIntent {
  ownerId: string;
  requestId: string;
  operation: WriteIntentOperation;
  resourceType: string;
  resourceId: string;
  /** Observability only (orphan analysis, tooling) — recovery never depends on it. */
  status: WriteIntentStatus;
  createdAt: string;
}

export type ClaimResult = { claimed: true } | { claimed: false; existing: WriteIntent };

export interface IWriteIntentStore {
  /**
   * Atomically claim a request id via PK insert. Returns `claimed: false`
   * with the previously stored intent when the key already exists.
   */
  claim(intent: Omit<WriteIntent, 'status' | 'createdAt'>): Promise<ClaimResult>;

  getByRequestId(ownerId: string, requestId: string): Promise<WriteIntent | null>;

  /** Mark the resource creation as finished. Observability only. */
  markCompleted(ownerId: string, requestId: string): Promise<void>;

  /**
   * TTL cleanup (C5) — deletes the owner's COMPLETED intents created before
   * the cutoff; returns count. CLAIMED intents are never bulk-deleted: the
   * cleanup task resolves each one individually (memory exists ⇒ resolvable
   * ⇒ deleteByRequestId; memory missing ⇒ true orphan ⇒ kept and reported).
   */
  deleteExpiredCompleted(ownerId: string, olderThanIso: string): Promise<number>;

  /** Dry-run counterpart of deleteExpiredCompleted. */
  countExpiredCompleted(ownerId: string, olderThanIso: string): Promise<number>;

  /** Expired intents still in `claimed` status, for individual resolution. */
  listExpiredClaimed(ownerId: string, olderThanIso: string): Promise<WriteIntent[]>;

  /** Targeted delete of a single resolved intent. */
  deleteByRequestId(ownerId: string, requestId: string): Promise<void>;
}
