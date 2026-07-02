import { access, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoPath = repoRoot.replace(/\\/g, '/');

config({ path: resolve(repoRoot, '.env'), quiet: true });

const REQUIRED_ENV = ['CLOUDFLARE_ACCOUNT_ID', 'D1_DATABASE_ID', 'D1_API_TOKEN'] as const;

function buildMcpConfig(): string {
  const config = {
    mcpServers: {
      'ai-memory-cloud': {
        command: 'npx',
        args: ['-y', 'tsx', `${repoPath}/src/mcp/stdio.ts`],
        cwd: repoPath,
      },
    },
  };
  return `${JSON.stringify(config, null, 2)}\n`;
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  console.log('AI Memory Cloud — setup MCP\n');

  if (!(await fileExists(resolve(repoRoot, '.env')))) {
    console.error('❌ File .env belum ada.');
    console.error('   Jalankan: cp .env.example .env');
    console.error('   Lalu isi CLOUDFLARE_ACCOUNT_ID, D1_DATABASE_ID, D1_API_TOKEN');
    process.exit(1);
  }

  const missing = REQUIRED_ENV.filter((key) => !process.env[key]?.trim());
  if (missing.length > 0) {
    console.error(`❌ .env belum lengkap. Isi: ${missing.join(', ')}`);
    process.exit(1);
  }

  const mcpJson = buildMcpConfig();

  await writeFile(resolve(repoRoot, '.mcp.json'), mcpJson, 'utf-8');
  console.log(`✓ .mcp.json          (Claude Code)`);

  await mkdir(resolve(repoRoot, '.cursor'), { recursive: true });
  await writeFile(resolve(repoRoot, '.cursor/mcp.json'), mcpJson, 'utf-8');
  console.log(`✓ .cursor/mcp.json     (Cursor)`);

  console.log(`
Selesai. Credential D1 dibaca dari .env — tidak perlu salin ke mcp.json.

Langkah berikutnya (pilih client Anda):

  Cursor
    1. Cursor → Settings → MCP → pastikan ai-memory-cloud hijau
    2. Reload Window
    3. Chat: "cari memory tentang [proyek]"

  Claude Code
    1. cd ${repoPath}
    2. claude
    3. Approve server ai-memory-cloud saat diminta
    4. Chat: "cari memory tentang [proyek]"

Opsional (sekali): npm run db:migrate
Uji MCP: npm run mcp  (Ctrl+C untuk stop)
`);
}

main().catch((error) => {
  console.error('Setup gagal:', error);
  process.exit(1);
});
