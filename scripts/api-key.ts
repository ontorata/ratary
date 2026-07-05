/**
 * Ratary API key CLI: create, rotate, list — no curl required.
 */
import {
  createIdentity,
  listIdentities,
  parseKeyCliArgs,
  pickRotatableIdentity,
  printApiKeyResult,
  printKeyHelp,
  rotateIdentity,
  tryBootstrap,
  writeKeyToEnv,
} from './lib/ratary-key-cli.js';

async function runCreate(argv: string[]): Promise<void> {
  const opts = parseKeyCliArgs(argv, 'create');
  console.log(`Ratary — buat API key\nHost: ${opts.baseUrl}\n`);

  let apiKey: string | null = null;

  if (!opts.apiKey) {
    console.log('Mencoba bootstrap (sekali, jika belum pernah)...');
    apiKey = await tryBootstrap(opts.baseUrl, opts.name!);
  }

  if (!apiKey) {
    if (!opts.apiKey) {
      console.error(`
Bootstrap tidak tersedia. Buat key baru dengan key lama:
  npm run key:create -- --url ${opts.baseUrl} --key aic_KEY_LAMA

Atau set RATARY_API_KEY di .env lalu jalankan lagi.
`);
      process.exit(1);
    }
    console.log('Membuat identity baru...');
    apiKey = await createIdentity(opts.baseUrl, opts.name!, opts.apiKey);
  } else {
    console.log('Bootstrap berhasil.');
  }

  printApiKeyResult(opts.baseUrl, apiKey, 'Key lama (jika ada) tetap aktif — ini identity baru.');
  if (opts.writeEnv) await writeKeyToEnv(opts.baseUrl, apiKey);
}

async function runRotate(argv: string[]): Promise<void> {
  const opts = parseKeyCliArgs(argv, 'rotate');
  if (!opts.apiKey) {
    console.error('Butuh key yang masih aktif: --key aic_... atau RATARY_API_KEY di .env');
    process.exit(1);
  }

  console.log(`Ratary — rotate API key\nHost: ${opts.baseUrl}\n`);

  const identities = await listIdentities(opts.baseUrl, opts.apiKey);
  const target = pickRotatableIdentity(identities, opts);

  console.log(`Rotate identity: ${target.name} (${target.id})`);
  const newKey = await rotateIdentity(opts.baseUrl, target.id, opts.apiKey);

  printApiKeyResult(
    opts.baseUrl,
    newKey,
    'Key lama untuk identity ini sudah TIDAK berlaku. Update Vercel Studio lalu redeploy.',
  );
  if (opts.writeEnv) await writeKeyToEnv(opts.baseUrl, newKey);
}

async function runList(argv: string[]): Promise<void> {
  const opts = parseKeyCliArgs(argv, 'list');
  if (!opts.apiKey) {
    console.error('Butuh key aktif: --key aic_... atau RATARY_API_KEY di .env');
    process.exit(1);
  }

  console.log(`Ratary — daftar identity\nHost: ${opts.baseUrl}\n`);

  const identities = await listIdentities(opts.baseUrl, opts.apiKey);
  if (identities.length === 0) {
    console.log('(kosong)');
    return;
  }

  for (const row of identities) {
    const status = row.active && !row.revoked_at ? 'active' : 'revoked';
    const used = row.last_used_at ? ` last_used=${row.last_used_at}` : '';
    console.log(`${row.id}  ${row.type.padEnd(12)}  ${row.name.padEnd(20)}  ${status}${used}`);
  }
}

async function main(): Promise<void> {
  const [command, ...rest] = process.argv.slice(2);

  if (!command || command === '--help' || command === '-h') {
    printKeyHelp();
    return;
  }

  if (rest.includes('--help') || rest.includes('-h')) {
    printKeyHelp(command);
    return;
  }

  if (command === 'create') return runCreate(rest);
  if (command === 'rotate') return runRotate(rest);
  if (command === 'list') return runList(rest);

  console.error(`Perintah tidak dikenal: ${command}\n`);
  printKeyHelp();
  process.exit(1);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`\nGagal: ${message}`);
  process.exit(1);
});
