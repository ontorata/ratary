import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import type {
  IWorkspaceMembership,
  WorkspacePermission,
} from '../../ports/enterprise/iworkspace-membership.port.js';
import { ForbiddenError } from '../../types/errors.js';

type MembershipRole = 'owner' | 'admin' | 'member' | 'viewer';

interface MembershipRow {
  role: string;
}

const ROLE_PERMISSIONS: Record<MembershipRole, ReadonlySet<WorkspacePermission>> = {
  owner: new Set(['memory.read', 'memory.write', 'memory.admin']),
  admin: new Set(['memory.read', 'memory.write', 'memory.admin']),
  member: new Set(['memory.read', 'memory.write']),
  viewer: new Set(['memory.read']),
};

function roleAllows(role: string, permission: WorkspacePermission): boolean {
  const normalized = role as MembershipRole;
  return ROLE_PERMISSIONS[normalized]?.has(permission) ?? false;
}

export class D1WorkspaceMembership implements IWorkspaceMembership {
  constructor(private readonly db: ISqlDatabase) {}

  async assertAccess(
    identityId: string,
    workspaceId: string,
    permission: WorkspacePermission,
  ): Promise<void> {
    const rows = await this.db.query<MembershipRow>(
      `SELECT role FROM workspace_memberships
       WHERE workspace_id = ? AND identity_id = ?`,
      [workspaceId, identityId],
    );

    const role = rows[0]?.role;
    if (!role || !roleAllows(role, permission)) {
      throw new ForbiddenError(`Missing workspace permission: ${permission}`);
    }
  }
}
