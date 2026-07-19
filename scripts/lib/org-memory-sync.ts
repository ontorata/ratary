import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  assertIngestionRun,
  type IngestionRun,
  type PipelineStageResult,
  type SourceDefinition,
  type SourceResult,
} from './knowledge-ingestion-contracts.js';
import { orchestratePipeline, type RawSourceFile } from './knowledge-ingestion-pipeline.js';
import { shouldExcludeIngestFile } from './org-memory-sync-excludes.js';

const REPO_ROOT = resolve(process.cwd());
const INGEST_LOG_PATH = resolve(REPO_ROOT, '.ai/reviews/org-memory-dogfood/ingestion-log.md');

type RunResult = IngestionRun & {
  excludedPaths: string[];
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

async function ingestSource(
  source: SourceDefinition,
  excludedPaths: string[],
): Promise<{ sourceResult: SourceResult; stageResults: PipelineStageResult[] }> {
  const sourceStart = Date.now();
  const files = await resolveSourceFiles(source);
  const readableFiles: RawSourceFile[] = [];
  let readFailures = 0;
  let stageFailures = 0;
  let skipped = 0;

  for (const file of files) {
    const exclude = shouldExcludeIngestFile(file);
    if (exclude.excluded) {
      skipped += 1;
      excludedPaths.push(`${file} (${exclude.reason ?? 'excluded'})`);
      continue;
    }

    try {
      const absolute = resolve(REPO_ROOT, file);
      const fileStat = await stat(absolute);
      if (!fileStat.isFile()) continue;
      const content = await readFile(absolute, 'utf-8');
      readableFiles.push({
        sourcePath: source.sourcePath,
        filePath: file,
        content,
        metadata: {
          sizeBytes: fileStat.size,
          encoding: 'utf-8',
          modifiedAt: fileStat.mtime.toISOString(),
        },
      });
    } catch {
      readFailures += 1;
    }
  }

  const pipelineResult = orchestratePipeline(readableFiles, {
    sourceFailed: readFailures,
    sourcePath: source.sourcePath,
  });
  stageFailures = pipelineResult.stageResults.reduce((sum, stage) => sum + stage.failed, 0);

  return {
    sourceResult: {
      sourcePath: source.sourcePath,
      ingested: pipelineResult.documents.length,
      failed: Math.max(readFailures, stageFailures),
      skipped,
      durationMs: Date.now() - sourceStart,
    },
    stageResults: pipelineResult.stageResults,
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
        `| source_path=\`${source.sourcePath}\` | ingested=${source.ingested} | failed=${source.failed} | skipped=${source.skipped ?? 0} | duration_ms=${source.durationMs} |`,
    )
    .join('\n');
  const stageRows = (result.stageResults ?? [])
    .map(
      (stage) =>
        `| stage=${stage.stage} | status=${stage.status} | processed=${stage.processed} | failed=${stage.failed} | checkpoint_id=\`${stage.checkpointId}\` | source_path=\`${stage.sourcePath ?? 'n/a'}\` |`,
    )
    .join('\n');
  const excludeRows =
    result.excludedPaths.length > 0
      ? result.excludedPaths.map((path) => `- excluded_path=\`${path}\``).join('\n')
      : '- excluded_path=`none`';

  return [
    `## run_id=${result.runId}`,
    '',
    `- started_at: ${result.startedAt}`,
    `- ended_at: ${result.endedAt}`,
    `- ingested=${result.totalIngested}`,
    `- failed=${result.totalFailed}`,
    `- skipped=${result.totalSkipped ?? 0}`,
    `- digest=${result.digest}`,
    '',
    '| source_path | ingested | failed | skipped | duration_ms |',
    '|-------------|----------|--------|---------|-------------|',
    sourceRows,
    '',
    '| stage | status | processed | failed | checkpoint_id | source_path |',
    '|-------|--------|-----------|--------|---------------|-------------|',
    stageRows.length > 0 ? stageRows : '| stage=n/a | status=n/a | processed=0 | failed=0 | checkpoint_id=`n/a` | source_path=`n/a` |',
    '',
    '### ingest_excludes (P1-E audit)',
    '',
    excludeRows,
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
      '| **Schema** | `run_id`, `source_path`, `ingested`, `failed`, `skipped` |',
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
  const excludedPaths: string[] = [];

  const sources: SourceResult[] = [];
  const stageResults: PipelineStageResult[] = [];
  for (const source of SOURCES) {
    const result = await ingestSource(source, excludedPaths);
    stageResults.push(...result.stageResults);
    sources.push(result.sourceResult);
  }

  const endedAt = new Date().toISOString();
  const totalIngested = sources.reduce((sum, source) => sum + source.ingested, 0);
  const totalFailed = sources.reduce((sum, source) => sum + source.failed, 0);
  const totalSkipped = sources.reduce((sum, source) => sum + (source.skipped ?? 0), 0);
  const digest = buildDigest(runId, sources);

  const runResult = assertIngestionRun({
    runId,
    startedAt,
    endedAt,
    totalIngested,
    totalFailed,
    totalSkipped,
    digest,
    sources,
    stageResults,
  }) as RunResult;

  runResult.excludedPaths = excludedPaths;

  await ensureLogFile();
  const runBlock = renderRunBlock(runResult);
  await writeFile(INGEST_LOG_PATH, `${(await readFile(INGEST_LOG_PATH, 'utf-8')).trimEnd()}\n\n${runBlock}`, 'utf-8');

  return runResult;
}
