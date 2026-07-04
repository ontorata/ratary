import type { DashboardPack, DashboardPackSummary } from '../types/dashboard.types.js';

/** Versioned Grafana JSON bundles in repo (ADR-034). */
export interface IDashboardPack {
  listPacks(): Promise<DashboardPackSummary[]>;
  getPack(packId: string): Promise<DashboardPack | null>;
}
