/** Enterprise tenant hierarchy node types (Phase 17 — ADR-032). */
export interface DepartmentDescriptor {
  readonly id: string;
  readonly organizationId: string;
  readonly name: string;
  readonly slug: string;
}

export interface TenantProjectDescriptor {
  readonly id: string;
  readonly organizationId: string;
  readonly departmentId: string;
  readonly name: string;
  readonly slug: string;
}

export interface HierarchyContext {
  readonly organizationId?: string;
  readonly departmentId?: string;
  readonly tenantProjectId?: string;
  readonly workspaceId?: string;
}

export interface PolicyBindingDescriptor {
  readonly id: string;
  readonly organizationId: string;
  readonly policyPackage: string;
  readonly effect: 'allow' | 'deny';
  readonly resourcePattern: string;
}
