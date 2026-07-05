import type {
  AssignRegionInput,
  CloudRegion,
  WorkspaceRegionAssignment,
} from '../types/region.types.js';

export interface IRegionRegistry {
  ensureDefaultRegion(code: string, displayName: string): Promise<CloudRegion>;
  registerRegion(input: {
    code: string;
    displayName: string;
    cloudProvider?: string;
  }): Promise<CloudRegion>;
  getRegionById(id: string): Promise<CloudRegion | null>;
  getRegionByCode(code: string): Promise<CloudRegion | null>;
  listRegions(): Promise<CloudRegion[]>;
  assignWorkspaceRegion(
    workspaceId: string,
    ownerId: string,
    input: AssignRegionInput,
  ): Promise<WorkspaceRegionAssignment>;
  getWorkspaceAssignment(workspaceId: string): Promise<WorkspaceRegionAssignment | null>;
}
