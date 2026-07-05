import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '../..');
const MANIFEST_PATH = join(ROOT, '.ai/phases/07.1-agent-forge/manifest.json');
const SKILLS_DIR = join(ROOT, '.cursor/skills');
const RULE_PATH = join(ROOT, '.cursor/rules/agent-forge.mdc');

interface ForgeManifest {
  stages: Array<{ skill: string }>;
  supporting: Array<{ skill: string }>;
}

function loadManifest(): ForgeManifest {
  return JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) as ForgeManifest;
}

function listForgeSkillDirs(): string[] {
  return readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('forge-'))
    .map((entry) => entry.name)
    .sort();
}

describe('Phase 07.1 Agent Forge manifest', () => {
  const manifest = loadManifest();
  const manifestSkills = [
    ...manifest.stages.map((s) => s.skill),
    ...manifest.supporting.map((s) => s.skill),
  ].sort();
  const diskSkills = listForgeSkillDirs();

  it('manifest lists 13 forge skills matching disk', () => {
    expect(manifestSkills).toEqual(diskSkills);
    expect(manifestSkills).toHaveLength(13);
  });

  it('each skill has SKILL.md with frontmatter name', () => {
    for (const skill of diskSkills) {
      const skillPath = join(SKILLS_DIR, skill, 'SKILL.md');
      expect(existsSync(skillPath), `${skill}/SKILL.md missing`).toBe(true);
      const content = readFileSync(skillPath, 'utf8');
      expect(content).toMatch(/^---\r?\nname: /);
      expect(content).toContain(`name: ${skill}`);
    }
  });

  it('agent-forge rule references phase PIPELINE path', () => {
    const rule = readFileSync(RULE_PATH, 'utf8');
    expect(rule).toContain('.ai/phases/07.1-agent-forge/PIPELINE.md');
    expect(rule).toContain('alwaysApply: true');
  });

  it('manifest declares phase SSOT path', () => {
    const raw = readFileSync(MANIFEST_PATH, 'utf8');
    expect(raw).toContain('"phase": ".ai/phases/07.1-agent-forge"');
  });
});
