import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { FileDashboardPack } from '../../src/observability/adapters/file-dashboard-pack.js';
import { FileSloRegistry } from '../../src/observability/adapters/file-slo-registry.js';

describe('Dashboard and SLO file packs', () => {
  const dashboards = new FileDashboardPack({
    rootDir: join(process.cwd(), 'observability', 'dashboards'),
  });
  const sloRegistry = new FileSloRegistry({
    rootDir: join(process.cwd(), 'observability', 'slo'),
  });

  it('lists six Grafana dashboard packs', async () => {
    const packs = await dashboards.listPacks();
    expect(packs.length).toBe(6);
    expect(packs.some((p) => p.id === 'overview')).toBe(true);
    expect(packs.some((p) => p.id === 'memory')).toBe(true);
  });

  it('loads overview dashboard JSON', async () => {
    const pack = await dashboards.getPack('overview');
    expect(pack).not.toBeNull();
    expect(pack?.grafanaJson.uid).toBe('ai-brain-overview');
  });

  it('loads SLO definitions and alert templates', async () => {
    const slos = await sloRegistry.listSlos();
    const alerts = await sloRegistry.listAlertTemplates();
    expect(slos.length).toBeGreaterThanOrEqual(4);
    expect(alerts.length).toBeGreaterThanOrEqual(3);
  });

  it('exports Alertmanager YAML', async () => {
    const yaml = await sloRegistry.exportAlertmanagerYaml();
    expect(yaml).toContain('ai-brain-slo-alerts');
    expect(yaml).toContain('HighHTTPErrorRate');
  });
});
