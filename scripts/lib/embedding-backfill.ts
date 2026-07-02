export interface EmbeddingBackfillCliOptions {
  dryRun: boolean;
  ownerId?: string;
  forceReembed: boolean;
  batchSize: number;
  projectId?: string;
}

export function parseEmbeddingBackfillArgs(argv: string[]): EmbeddingBackfillCliOptions {
  const dryRun = !argv.includes('--execute');
  const forceReembed = argv.includes('--force');
  const ownerArg = argv.find((arg) => arg.startsWith('--owner='));
  const batchArg = argv.find((arg) => arg.startsWith('--batch-size='));
  const projectArg = argv.find((arg) => arg.startsWith('--project='));

  const parsedBatchSize = batchArg ? Number(batchArg.split('=')[1]) : 32;

  return {
    dryRun,
    ownerId: ownerArg?.split('=')[1],
    forceReembed,
    batchSize: Number.isFinite(parsedBatchSize) && parsedBatchSize > 0 ? parsedBatchSize : 32,
    projectId: projectArg?.split('=')[1],
  };
}
