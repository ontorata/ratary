export interface DashboardPackSummary {
  id: string;
  title: string;
  version: string;
  description?: string;
}

export interface DashboardPack extends DashboardPackSummary {
  grafanaJson: Record<string, unknown>;
}
