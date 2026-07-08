import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const REPO_ROOT = resolve(process.cwd());
const INGEST_LOG_PATH = resolve(REPO_ROOT, '.ai/reviews/org-memory-dogfood/ingestion-log.md');

type SourceDefinition = {
  sourcePath: string;
  mode: 'directory' | 'file' | 'adr-glob';
};

type SourceResult = {
  sourcePath: string;
  ingested: number;
  failed: number;
  durationMs: number;
};

type RunResult = {
  runId: string;
  startedAt: string;
  endedAt: string;
  totalIngested: number;
  totalFailed: number;
  digest: string;
  sources: SourceResult[];
};

const SOURCES: SourceDefinition[] = [
  { sourcePath: '.ai/core/', mode: 'directory' },
  { sourcePath: 'docs/architecture/', mode: 'directory' },
  { sourcePath: '.ai/core/architecture/ADR-*.md', mode: 'adr-glob' },
  { sourcePath: '.ai/governance/releases/', mode: 'directory' },
  { sourcePath: '.ai/reviews/', mode: 'directory' },
  { sourcePath: '.ai/sessions/CURRENT.md', mode: 'file' },
];

async function listFilesRecursive(directoryPath: string): Promise<string[]> {
  const absolutePath = resolve(REPO_ROOT, directoryPath);
  const entries = await readdir(absolutePath, { withFileTypes: true });
  const output: string[] = [];

  for (const entry of entries) {
    if (entry.name === '.git') continue;
    const relPath = `${directoryPath.replace(/\\/g, '/').replace(/\/$/, '')}/${entry.name}`.replace(
      /^\.\/+/,
      '',
    );

    if (entry.isDirectory()) {
      const nested = await listFilesRecursive(relPath);
      output.push(...nested);
      continue;
    }

    output.push(relPath);
  }

  return output;
}

async function resolveSourceFiles(source: SourceDefinition): Promise<string[]> {
  if (source.mode === 'file') {
    return [source.sourcePath];
  }

  if (source.mode === 'adr-glob') {
    const dir = '.ai/core/architecture';
    const files = await listFilesRecursive(dir);
    return files.filter((file) => /\/ADR-.*\.md$/i.test(`/${file}`));
  }

  return listFilesRecursive(source.sourcePath);
}

async function ingestSource(source: SourceDefinition): Promise<SourceResult> {
  const sourceStart = Date.now();
  const files = await resolveSourceFiles(source);
  let ingested = 0;
  let failed = 0;

  for (const file of files) {
    try {
      const absolute = resolve(REPO_ROOT, file);
      const fileStat = await stat(absolute);
      if (!fileStat.isFile()) continue;
      await readFile(absolute);
      ingested += 1;
    } catch {
      failed += 1;
    }
  }

  return {
    sourcePath: source.sourcePath,
    ingested,
    failed,
    durationMs: Date.now() - sourceStart,
  };
}

function buildDigest(runId: string, sources: SourceResult[]): string {
  const payload = JSON.stringify({ runId, sources });
  return createHash('sha256').update(payload).digest('hex').slice(0, 16);
}

function renderRunBlock(result: RunResult): string {
  const sourceRows = result.sources
    .map(
      (source) =>
        `| source_path=\`${source.sourcePath}\` | ingested=${source.ingested} | failed=${source.failed} | duration_ms=${source.durationMs} |`,
    )
    .join('\n');

  return [
    `## run_id=${result.runId}`,
    '',
    `- started_at: ${result.startedAt}`,
    `- ended_at: ${result.endedAt}`,
    `- ingested=${result.totalIngested}`,
    `- failed=${result.totalFailed}`,
    `- digest=${result.digest}`,
    '',
    '| source_path | ingested | failed | duration_ms |',
    '|-------------|----------|--------|-------------|',
    sourceRows,
    '',
  ].join('\n');
}

async function ensureLogFile(): Promise<void> {
  await mkdir(resolve(REPO_ROOT, '.ai/reviews/org-memory-dogfood'), { recursive: true });

  try {
    await stat(INGEST_LOG_PATH);
  } catch {
    const initial = [
      '# P1-A Org Memory Dogfood — Ingestion Log',
      '',
      '| Field | Value |',
      '|-------|-------|',
      '| **Status** | Active |',
      '| **Schema** | `run_id`, `source_path`, `ingested`, `failed` |',
      '',
      '---',
      '',
    ].join('\n');
    await writeFile(INGEST_LOG_PATH, `${initial}\n`, 'utf-8');
  }
}

export async function runOrgMemorySync(): Promise<RunResult> {
  const runId = randomUUID();
  const startedAt = new Date().toISOString();

  const sources: SourceResult[] = [];
  for (const source of SOURCES) {
    const result = await ingestSource(source);
    sources.push(result);
  }

  const endedAt = new Date().toISOString();
  const totalIngested = sources.reduce((sum, source) => sum + source.ingested, 0);
  const totalFailed = sources.reduce((sum, source) => sum + source.failed, 0);
  const digest = buildDigest(runId, sources);

  const runResult: RunResult = {
    runId,
    startedAt,
    endedAt,
    totalIngested,
    totalFailed,
    digest,
    sources,
  };

  await ensureLogFile();
  const runBlock = renderRunBlock(runResult);
  await writeFile(INGEST_LOG_PATH, `${(await readFile(INGEST_LOG_PATH, 'utf-8')).trimEnd()}\n\n${runBlock}`, 'utf-8');

  return runResult;
}
