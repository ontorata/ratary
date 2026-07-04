import type { AlertRuleTemplate, SloDefinition, SloRegistryDocument } from '../types/slo.types.js';

/** SLO definitions + Alertmanager rule templates (ADR-034). */
export interface ISloRegistry {
  getDocument(): Promise<SloRegistryDocument>;
  listSlos(): Promise<SloDefinition[]>;
  listAlertTemplates(): Promise<AlertRuleTemplate[]>;
  exportAlertmanagerYaml(): Promise<string>;
}
