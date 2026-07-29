/**
 * Deterministic TypeScript/JavaScript Code Memory extractor (ADR-070 C3/C4).
 * Indexer version: CODE_INDEXER_VERSION (`ts-api-1.0`).
 * Uses the TypeScript compiler API — no LLM, not on the memory write hot path.
 */
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import ts from 'typescript';
import {
  CODE_INDEXER_VERSION,
  type CodeEdge,
  type CodeNode,
  type CodeNodeKind,
} from '../../types/code-memory.js';
import { stableCodeId } from './stable-code-id.js';

const SOURCE_EXT = new Set(['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs']);
const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  'coverage',
  '.git',
  '.next',
  '.turbo',
  'build',
]);

export interface ExtractCodeGraphInput {
  ownerId: string;
  /** Logical repository id used in stable keys (e.g. ontorata/ratary). */
  repository: string;
  /** Absolute path to the repo root to walk. */
  rootDir: string;
  /** Optional git commit for edge evidence. */
  gitCommit?: string | null;
  now?: string;
}

export interface ExtractCodeGraphResult {
  indexerVersion: typeof CODE_INDEXER_VERSION;
  nodes: CodeNode[];
  edges: CodeEdge[];
  stats: {
    filesScanned: number;
    nodes: number;
    edges: number;
  };
}

function contentHash(text: string): string {
  return createHash('sha256').update(text).digest('hex').slice(0, 32);
}

function toPosix(path: string): string {
  return path.split(sep).join('/');
}

function languageFor(path: string): string {
  if (path.endsWith('.tsx') || path.endsWith('.jsx')) return 'tsx';
  if (path.endsWith('.ts') || path.endsWith('.mts') || path.endsWith('.cts')) return 'typescript';
  return 'javascript';
}

function walkSourceFiles(rootDir: string): string[] {
  const out: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir)) {
      if (SKIP_DIRS.has(entry)) continue;
      const full = join(dir, entry);
      const st = statSync(full);
      if (st.isDirectory()) {
        walk(full);
        continue;
      }
      const dot = entry.lastIndexOf('.');
      if (dot < 0) continue;
      const ext = entry.slice(dot).toLowerCase();
      if (SOURCE_EXT.has(ext)) out.push(full);
    }
  };
  walk(rootDir);
  return out.sort();
}

function namedIdentifierText(node: ts.Node): string | null {
  if (!('name' in node) || node.name == null) return null;
  const nameNode = node.name;
  if (typeof nameNode !== 'object') return null;
  if (!ts.isIdentifier(nameNode as ts.Node)) return null;
  return (nameNode as ts.Identifier).text;
}

function kindForDeclaration(node: ts.Node): CodeNodeKind | null {
  if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node)) {
    return 'function';
  }
  if (ts.isClassDeclaration(node)) return 'class';
  if (ts.isInterfaceDeclaration(node)) return 'interface';
  if (ts.isEnumDeclaration(node)) return 'enum';
  if (ts.isTypeAliasDeclaration(node)) return 'type';
  if (ts.isMethodDeclaration(node)) return 'method';
  if (ts.isPropertyDeclaration(node) || ts.isPropertySignature(node)) return 'field';
  return null;
}

export function extractTsJsCodeGraph(input: ExtractCodeGraphInput): ExtractCodeGraphResult {
  const now = input.now ?? new Date().toISOString();
  const repoKey = `repo:${input.repository}`;
  const repoId = stableCodeId(input.ownerId, repoKey);
  const nodes: CodeNode[] = [];
  const edges: CodeEdge[] = [];
  const nodeByKey = new Map<string, CodeNode>();

  const pushNode = (node: CodeNode): CodeNode => {
    const existing = nodeByKey.get(node.stableKey);
    if (existing) return existing;
    nodeByKey.set(node.stableKey, node);
    nodes.push(node);
    return node;
  };

  const pushEdge = (
    type: CodeEdge['type'],
    fromId: string,
    toId: string,
    rule: string,
  ): void => {
    const natural = `${type}:${fromId}:${toId}`;
    const id = stableCodeId(input.ownerId, `edge:${natural}`);
    if (edges.some((e) => e.id === id)) return;
    edges.push({
      id,
      ownerId: input.ownerId,
      type,
      fromId,
      toId,
      evidence: {
        indexerVersion: CODE_INDEXER_VERSION,
        rule,
        repoCommit: input.gitCommit ?? null,
      },
      createdAt: now,
    });
  };

  pushNode({
    id: repoId,
    ownerId: input.ownerId,
    kind: 'repository',
    repoId: null,
    stableKey: repoKey,
    displayName: input.repository,
    language: null,
    sourceRange: null,
    contentHash: null,
    indexerVersion: CODE_INDEXER_VERSION,
    indexedAt: now,
  });

  const files = walkSourceFiles(input.rootDir);
  for (const abs of files) {
    const rel = toPosix(relative(input.rootDir, abs));
    const text = readFileSync(abs, 'utf8');
    const fileKey = `file:${input.repository}:${rel}`;
    const fileNode = pushNode({
      id: stableCodeId(input.ownerId, fileKey),
      ownerId: input.ownerId,
      kind: 'file',
      repoId,
      stableKey: fileKey,
      displayName: rel,
      language: languageFor(rel),
      sourceRange: { path: rel, startLine: 1, endLine: text.split(/\r?\n/).length },
      contentHash: contentHash(text),
      indexerVersion: CODE_INDEXER_VERSION,
      indexedAt: now,
    });
    pushEdge('BELONGS_TO', fileNode.id, repoId, 'file_in_repo');
    pushEdge('DECLARES', repoId, fileNode.id, 'repo_declares_file');

    const sf = ts.createSourceFile(rel, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const visit = (node: ts.Node, parentSymbolKey: string | null): void => {
      if (ts.isImportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        const spec = node.moduleSpecifier.text;
        const importKey = `import:${input.repository}:${rel}->${spec}`;
        const importNode = pushNode({
          id: stableCodeId(input.ownerId, importKey),
          ownerId: input.ownerId,
          kind: 'module',
          repoId,
          stableKey: importKey,
          displayName: spec,
          language: fileNode.language,
          sourceRange: {
            path: rel,
            startLine: sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1,
            endLine: sf.getLineAndCharacterOfPosition(node.getEnd()).line + 1,
          },
          contentHash: null,
          indexerVersion: CODE_INDEXER_VERSION,
          indexedAt: now,
        });
        pushEdge('IMPORTS', fileNode.id, importNode.id, 'import_declaration');
      }

      const kind = kindForDeclaration(node);
      const name = namedIdentifierText(node);
      if (kind && name) {
        const symbolKey = parentSymbolKey
          ? `file:${input.repository}:${rel}#${parentSymbolKey}.${name}`
          : `file:${input.repository}:${rel}#${name}`;
        const start = sf.getLineAndCharacterOfPosition(node.getStart(sf));
        const end = sf.getLineAndCharacterOfPosition(node.getEnd());
        const symbolNode = pushNode({
          id: stableCodeId(input.ownerId, symbolKey),
          ownerId: input.ownerId,
          kind,
          repoId,
          stableKey: symbolKey,
          displayName: name,
          language: fileNode.language,
          sourceRange: {
            path: rel,
            startLine: start.line + 1,
            endLine: end.line + 1,
          },
          contentHash: null,
          indexerVersion: CODE_INDEXER_VERSION,
          indexedAt: now,
        });
        pushEdge('DECLARES', fileNode.id, symbolNode.id, 'source_declares_symbol');
        pushEdge('BELONGS_TO', symbolNode.id, fileNode.id, 'symbol_belongs_to_file');

        if (ts.isClassDeclaration(node) || ts.isInterfaceDeclaration(node)) {
          ts.forEachChild(node, (child) => visit(child, name));
          return;
        }
      }

      ts.forEachChild(node, (child) => visit(child, parentSymbolKey));
    };
    visit(sf, null);
  }

  return {
    indexerVersion: CODE_INDEXER_VERSION,
    nodes,
    edges,
    stats: {
      filesScanned: files.length,
      nodes: nodes.length,
      edges: edges.length,
    },
  };
}
