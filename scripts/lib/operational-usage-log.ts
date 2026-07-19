import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';

export const OPERATIONAL_USAGE_LOG_SCHEMA_VERSION = '1.0';

function repoRoot(): string {
  return resolve(process.cwd());
}

export function operationalUsageLogPath(): string {
  return resolve(repoRoot(), '.ai/reviews/org-memory-dogfood/operational-usage-log.md');
}

export type DogfoodSessionEntry = {
  sessionId: string;
  timestamp: string;
  operator: string;
  tools: string[];
  querySummary: string;
  outcome: 'success' | 'partial' | 'failed';
  durationMs: number;
};

export type AppendDogfoodSessionInput = {
  operator?: string;
  tools: string[];
  querySummary: string;
  outcome?: DogfoodSessionEntry['outcome'];
  durationMs?: number;
  sessionId?: string;
  timestamp?: string;
};

function renderSessionBlock(entry: DogfoodSessionEntry): string {
  return [
    `## session_id=${entry.sessionId}`,
    '',
    `- schema_version=${OPERATIONAL_USAGE_LOG_SCHEMA_VERSION}`,
    `- timestamp=${entry.timestamp}`,
    `- operator=${entry.operator}`,
    `- tools=${entry.tools.join(',')}`,
    `- query_summary=${entry.querySummary}`,
    `- outcome=${entry.outcome}`,
    `- duration_ms=${entry.durationMs}`,
    '',
  ].join('\n');
}

export async function ensureOperationalUsageLog(): Promise<void> {
  const logPath = operationalUsageLogPath();
  await mkdir(resolve(repoRoot(), '.ai/reviews/org-memory-dogfood'), { recursive: true });
  try {
    await stat(logPath);
  } catch {
    const header = [
      '# P1-E Operational Proof — Usage Log',
      '',
      '| Field | Value |',
      '|-------|-------|',
      '| **Status** | Active |',
      '| **Schema** | `session_id`, `timestamp`, `operator`, `tools`, `query_summary`, `outcome`, `duration_ms` |',
      `| **Schema version** | ${OPERATIONAL_USAGE_LOG_SCHEMA_VERSION} |`,
      '',
      '---',
      '',
    ].join('\n');
    await writeFile(logPath, `${header}\n`, 'utf-8');
  }
}

export async function appendDogfoodSession(input: AppendDogfoodSessionInput): Promise<DogfoodSessionEntry> {
  const entry: DogfoodSessionEntry = {
    sessionId: input.sessionId ?? randomUUID(),
    timestamp: input.timestamp ?? new Date().toISOString(),
    operator: input.operator ?? 'operator',
    tools: input.tools,
    querySummary: input.querySummary,
    outcome: input.outcome ?? 'success',
    durationMs: input.durationMs ?? 0,
  };

  await ensureOperationalUsageLog();
  const logPath = operationalUsageLogPath();
  const current = await readFile(logPath, 'utf-8');
  await writeFile(
    logPath,
    `${current.trimEnd()}\n\n${renderSessionBlock(entry)}`,
    'utf-8',
  );

  return entry;
}

export function countDogfoodSessions(content: string): number {
  return (content.match(/^## session_id=/gm) ?? []).length;
}
