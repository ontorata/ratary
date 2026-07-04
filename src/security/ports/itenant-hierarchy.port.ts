import type {
  DepartmentDescriptor,
  HierarchyContext,
  PolicyBindingDescriptor,
  TenantProjectDescriptor,
} from '../types/hierarchy.types.js';

export interface ITenantHierarchy {
  getDepartment(departmentId: string): Promise<DepartmentDescriptor | null>;
  getProject(projectId: string): Promise<TenantProjectDescriptor | null>;
  listDepartments(organizationId: string): Promise<DepartmentDescriptor[]>;
  listProjects(departmentId: string): Promise<TenantProjectDescriptor[]>;
  resolveHierarchyForWorkspace(
    organizationId: string,
    workspaceId: string,
  ): Promise<HierarchyContext>;
  listPolicyBindings(organizationId: string): Promise<PolicyBindingDescriptor[]>;
}
