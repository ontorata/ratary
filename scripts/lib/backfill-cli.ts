export interface BackfillCliOptions {
  dryRun: boolean;
  ownerId?: string;
  batchSize: number;
}

export function parseBackfillArgs(argv: string[]): BackfillCliOptions {
  const dryRun = !argv.includes('--execute');
  const ownerArg = argv.find((arg) => arg.startsWith('--owner='));
  const batchArg = argv.find((arg) => arg.startsWith('--batch-size='));
  const parsedBatchSize = batchArg ? Number(batchArg.split('=')[1]) : 100;

  return {
    dryRun,
    ownerId: ownerArg?.split('=')[1],
    batchSize: Number.isFinite(parsedBatchSize) && parsedBatchSize > 0 ? parsedBatchSize : 100,
  };
}
