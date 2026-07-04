export interface CloudRegion {
  id: string;
  code: string;
  displayName: string;
  cloudProvider?: string;
  isActive: boolean;
  createdAt: string;
}

export interface WorkspaceRegionAssignment {
  workspaceId: string;
  ownerId: string;
  primaryRegionId: string;
  secondaryRegionId?: string;
  readPreference: 'primary' | 'secondary' | 'nearest';
  updatedAt: string;
}

export interface AssignRegionInput {
  primaryRegionId: string;
  secondaryRegionId?: string;
  readPreference?: 'primary' | 'secondary' | 'nearest';
}
