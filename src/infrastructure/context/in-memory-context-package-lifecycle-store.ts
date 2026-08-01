import type {
  ContextPackageLifecycleRecord,
  IContextPackageLifecycleStore,
} from '../../ports/context/icontext-package-lifecycle-store.port.js';
import type { ContextPackageLifecycleState } from '../../memory/context-package-envelope.js';

/** Test / local double for ADR-1013 lifecycle SoR. */
export class InMemoryContextPackageLifecycleStore implements IContextPackageLifecycleStore {
  private readonly rows = new Map<string, ContextPackageLifecycleRecord>();

  private key(ownerId: string, packageId: string): string {
    return `${ownerId}::${packageId}`;
  }

  async insertActive(input: {
    packageId: string;
    ownerId: string;
    createdAt: string;
  }): Promise<void> {
    const key = this.key(input.ownerId, input.packageId);
    if (this.rows.has(key)) return;
    this.rows.set(key, {
      packageId: input.packageId,
      ownerId: input.ownerId,
      lifecycleState: 'active',
      createdAt: input.createdAt,
      updatedAt: input.createdAt,
    });
  }

  async get(ownerId: string, packageId: string): Promise<ContextPackageLifecycleRecord | null> {
    return this.rows.get(this.key(ownerId, packageId)) ?? null;
  }

  async updateState(
    ownerId: string,
    packageId: string,
    lifecycleState: ContextPackageLifecycleState,
    updatedAt: string,
  ): Promise<boolean> {
    const key = this.key(ownerId, packageId);
    const existing = this.rows.get(key);
    if (!existing) return false;
    this.rows.set(key, { ...existing, lifecycleState, updatedAt });
    return true;
  }
}
