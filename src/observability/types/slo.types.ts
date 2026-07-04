export interface SloDefinition {
  id: string;
  name: string;
  description: string;
  target: number;
  window: string;
  metric: string;
  threshold?: string;
}

export interface AlertRuleTemplate {
  id: string;
  name: string;
  expr: string;
  for: string;
  severity: 'critical' | 'warning' | 'info';
  annotations?: Record<string, string>;
}

export interface SloRegistryDocument {
  version: string;
  slos: SloDefinition[];
  alerts: AlertRuleTemplate[];
}
