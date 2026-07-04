function parseArgs(): { dryRun: boolean } {
  return { dryRun: !process.argv.includes('--execute') };
}

async function reflectSignals(): Promise<void> {
  const { dryRun } = parseArgs();
  const enabled = process.env.RANKING_ADAPTATION_ENABLED === 'true';

  console.log(`Signal reflection (${dryRun ? 'dry-run' : 'execute'})...`);
  console.log(`  RANKING_ADAPTATION_ENABLED=${enabled}`);

  if (!enabled) {
    console.log('Ranking adaptation disabled — no weight changes applied.');
    return;
  }

  console.log('Batch reflection is advisory-only in this release; no runtime weights mutated.');
}

reflectSignals().catch((error) => {
  console.error('Signal reflection failed:', error);
  process.exit(1);
});
