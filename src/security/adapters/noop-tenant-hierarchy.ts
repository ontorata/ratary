import type { ITenantHierarchy } from '../ports/itenant-hierarchy.port.js';
import type {
  DepartmentDescriptor,
  HierarchyContext,
  PolicyBindingDescriptor,
  TenantProjectDescriptor,
} from '../types/hierarchy.types.js';

/** No-op hierarchy when ENTERPRISE_SECURITY_V2=false. */
export class NoOpTenantHierarchy implements ITenantHierarchy {
  async getDepartment(_departmentId: string): Promise<DepartmentDescriptor | null> {
    return null;
  }

  async getProject(_projectId: string): Promise<TenantProjectDescriptor | null> {
    return null;
  }

  async listDepartments(_organizationId: string): Promise<DepartmentDescriptor[]> {
    return [];
  }

  async listProjects(_departmentId: string): Promise<TenantProjectDescriptor[]> {
    return [];
  }

  async resolveHierarchyForWorkspace(
    organizationId: string,
    workspaceId: string,
  ): Promise<HierarchyContext> {
    return { organizationId, workspaceId };
  }

  async listPolicyBindings(_organizationId: string): Promise<PolicyBindingDescriptor[]> {
    return [];
  }
}
