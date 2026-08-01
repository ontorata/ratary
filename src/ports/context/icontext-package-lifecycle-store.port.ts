import type { ContextPackageLifecycleState } from '../../memory/context-package-envelope.js';

export type ContextPackageLifecycleRecord = Readonly<{
  packageId: string;
  ownerId: string;
  lifecycleState: ContextPackageLifecycleState;
  createdAt: string;
  updatedAt: string;
}>;

/** ADR-1013 — usage-eligibility SoR for minted Context Packages (payload remains immutable). */
export interface IContextPackageLifecycleStore {
  insertActive(input: {
    packageId: string;
    ownerId: string;
    createdAt: string;
  }): Promise<void>;

  get(ownerId: string, packageId: string): Promise<ContextPackageLifecycleRecord | null>;

  /** Returns false when no row for owner+packageId. */
  updateState(
    ownerId: string,
    packageId: string,
    lifecycleState: ContextPackageLifecycleState,
    updatedAt: string,
  ): Promise<boolean>;
}
