import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { ISloRegistry } from '../ports/islo-registry.port.js';
import type { AlertRuleTemplate, SloDefinition, SloRegistryDocument } from '../types/slo.types.js';

export interface FileSloRegistryOptions {
  rootDir?: string;
}

const EMPTY_DOC: SloRegistryDocument = { version: '1', slos: [], alerts: [] };

/** Loads SLO + Alertmanager templates from `observability/slo/`. */
export class FileSloRegistry implements ISloRegistry {
  private readonly rootDir: string;

  constructor(options: FileSloRegistryOptions = {}) {
    this.rootDir = options.rootDir ?? join(process.cwd(), 'observability', 'slo');
  }

  async getDocument(): Promise<SloRegistryDocument> {
    const path = join(this.rootDir, 'slo-definitions.json');
    if (!existsSync(path)) return EMPTY_DOC;
    try {
      return JSON.parse(readFileSync(path, 'utf8')) as SloRegistryDocument;
    } catch {
      return EMPTY_DOC;
    }
  }

  async listSlos(): Promise<SloDefinition[]> {
    const doc = await this.getDocument();
    return doc.slos;
  }

  async listAlertTemplates(): Promise<AlertRuleTemplate[]> {
    const doc = await this.getDocument();
    return doc.alerts;
  }

  async exportAlertmanagerYaml(): Promise<string> {
    const path = join(this.rootDir, 'alertmanager-rules.yaml');
    if (!existsSync(path)) return 'groups: []\n';
    return readFileSync(path, 'utf8');
  }
}

export class NoOpSloRegistry implements ISloRegistry {
  async getDocument(): Promise<SloRegistryDocument> {
    return EMPTY_DOC;
  }

  async listSlos(): Promise<SloDefinition[]> {
    return [];
  }

  async listAlertTemplates(): Promise<AlertRuleTemplate[]> {
    return [];
  }

  async exportAlertmanagerYaml(): Promise<string> {
    return 'groups: []\n';
  }
}
