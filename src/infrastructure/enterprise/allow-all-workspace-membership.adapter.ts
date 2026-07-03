import type { IWorkspaceMembership } from '../../ports/enterprise/iworkspace-membership.port.js';

/** Default when ENTERPRISE_RBAC=false — preserves Phase 9 behavior. */
export class AllowAllWorkspaceMembership implements IWorkspaceMembership {
  async assertAccess(): Promise<void> {}
}
