import type { ISqlDatabase } from '../../ports/sql/isql-database.port.js';
import type { ITenantHierarchy } from '../../security/ports/itenant-hierarchy.port.js';
import type {
  DepartmentDescriptor,
  HierarchyContext,
  PolicyBindingDescriptor,
  TenantProjectDescriptor,
} from '../../security/types/hierarchy.types.js';

interface DepartmentRow {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
}

interface ProjectRow {
  id: string;
  organization_id: string;
  department_id: string;
  name: string;
  slug: string;
}

interface WorkspaceHierarchyRow {
  workspace_id: string;
  organization_id: string;
  department_id: string | null;
  tenant_project_id: string | null;
}

interface PolicyBindingRow {
  id: string;
  organization_id: string;
  policy_package: string;
  effect: string;
  resource_pattern: string;
}

export class SqlTenantHierarchy implements ITenantHierarchy {
  constructor(private readonly sql: ISqlDatabase) {}

  async getDepartment(departmentId: string): Promise<DepartmentDescriptor | null> {
    const rows = await this.sql.query<DepartmentRow>(
      'SELECT id, organization_id, name, slug FROM departments WHERE id = ? LIMIT 1',
      [departmentId],
    );
    const row = rows[0];
    return row ? mapDepartment(row) : null;
  }

  async getProject(projectId: string): Promise<TenantProjectDescriptor | null> {
    const rows = await this.sql.query<ProjectRow>(
      'SELECT id, organization_id, department_id, name, slug FROM tenant_projects WHERE id = ? LIMIT 1',
      [projectId],
    );
    const row = rows[0];
    return row ? mapProject(row) : null;
  }

  async listDepartments(organizationId: string): Promise<DepartmentDescriptor[]> {
    const rows = await this.sql.query<DepartmentRow>(
      'SELECT id, organization_id, name, slug FROM departments WHERE organization_id = ? ORDER BY name',
      [organizationId],
    );
    return rows.map(mapDepartment);
  }

  async listProjects(departmentId: string): Promise<TenantProjectDescriptor[]> {
    const rows = await this.sql.query<ProjectRow>(
      'SELECT id, organization_id, department_id, name, slug FROM tenant_projects WHERE department_id = ? ORDER BY name',
      [departmentId],
    );
    return rows.map(mapProject);
  }

  async resolveHierarchyForWorkspace(
    organizationId: string,
    workspaceId: string,
  ): Promise<HierarchyContext> {
    const rows = await this.sql.query<WorkspaceHierarchyRow>(
      `SELECT workspace_id, organization_id, department_id, tenant_project_id
       FROM workspace_hierarchy_bindings
       WHERE organization_id = ? AND workspace_id = ?
       LIMIT 1`,
      [organizationId, workspaceId],
    );
    const row = rows[0];
    return {
      organizationId,
      workspaceId,
      departmentId: row?.department_id ?? undefined,
      tenantProjectId: row?.tenant_project_id ?? undefined,
    };
  }

  async listPolicyBindings(organizationId: string): Promise<PolicyBindingDescriptor[]> {
    const rows = await this.sql.query<PolicyBindingRow>(
      `SELECT id, organization_id, policy_package, effect, resource_pattern
       FROM policy_bindings WHERE organization_id = ?`,
      [organizationId],
    );
    return rows.map((row) => ({
      id: row.id,
      organizationId: row.organization_id,
      policyPackage: row.policy_package,
      effect: row.effect === 'deny' ? 'deny' : 'allow',
      resourcePattern: row.resource_pattern,
    }));
  }
}

function mapDepartment(row: DepartmentRow): DepartmentDescriptor {
  return {
    id: row.id,
    organizationId: row.organization_id,
    name: row.name,
    slug: row.slug,
  };
}

function mapProject(row: ProjectRow): TenantProjectDescriptor {
  return {
    id: row.id,
    organizationId: row.organization_id,
    departmentId: row.department_id,
    name: row.name,
    slug: row.slug,
  };
}
