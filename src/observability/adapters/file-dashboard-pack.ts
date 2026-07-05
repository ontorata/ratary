import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { IDashboardPack } from '../ports/idashboard-pack.port.js';
import type { DashboardPack, DashboardPackSummary } from '../types/dashboard.types.js';

export interface FileDashboardPackOptions {
  rootDir?: string;
}

/** Loads Grafana JSON dashboard packs from `observability/dashboards/`. */
export class FileDashboardPack implements IDashboardPack {
  private readonly rootDir: string;

  constructor(options: FileDashboardPackOptions = {}) {
    this.rootDir = options.rootDir ?? join(process.cwd(), 'observability', 'dashboards');
  }

  async listPacks(): Promise<DashboardPackSummary[]> {
    if (!existsSync(this.rootDir)) return [];
    const files = readdirSync(this.rootDir).filter((f) => f.endsWith('.json'));
    const packs: DashboardPackSummary[] = [];
    for (const file of files) {
      const pack = await this.loadFile(file);
      if (pack) {
        packs.push({
          id: pack.id,
          title: pack.title,
          version: pack.version,
          description: pack.description,
        });
      }
    }
    return packs;
  }

  async getPack(packId: string): Promise<DashboardPack | null> {
    const candidate = `${packId}.json`;
    if (!existsSync(join(this.rootDir, candidate))) {
      const files = existsSync(this.rootDir) ? readdirSync(this.rootDir) : [];
      const match = files.find((f) => f.replace(/\.json$/, '') === packId);
      if (!match) return null;
      return this.loadFile(match);
    }
    return this.loadFile(candidate);
  }

  private async loadFile(filename: string): Promise<DashboardPack | null> {
    try {
      const raw = readFileSync(join(this.rootDir, filename), 'utf8');
      const grafanaJson = JSON.parse(raw) as Record<string, unknown>;
      const id = filename.replace(/\.json$/, '');
      return {
        id,
        title: String(grafanaJson.title ?? id),
        version: String(grafanaJson.version ?? '1'),
        description:
          typeof grafanaJson.description === 'string' ? grafanaJson.description : undefined,
        grafanaJson,
      };
    } catch {
      return null;
    }
  }
}

/** Empty dashboard pack for tests / disabled mode. */
export class NoOpDashboardPack implements IDashboardPack {
  async listPacks(): Promise<DashboardPackSummary[]> {
    return [];
  }

  async getPack(_packId: string): Promise<DashboardPack | null> {
    return null;
  }
}
