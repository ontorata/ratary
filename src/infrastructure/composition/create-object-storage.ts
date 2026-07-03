import type { Env } from '../../config/env.js';
import type { IObjectStorage } from '../../ports/storage/iobject-storage.port.js';
import { createS3ObjectCommands } from '../_shared/s3-object-storage.commands.js';
import { InlineObjectStorage } from '../storage/inline-object-storage.adapter.js';
import {
  createR2ObjectStorage,
  R2ObjectStorageAdapter,
} from '../storage/r2-object-storage.adapter.js';

export function createObjectStorage(env: Env): IObjectStorage {
  if (env.OBJECT_STORAGE_PROVIDER === 'r2') {
    const accountId = env.R2_ACCOUNT_ID ?? env.CLOUDFLARE_ACCOUNT_ID;
    if (!accountId || !env.R2_BUCKET_NAME || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY) {
      throw new Error(
        'R2_BUCKET_NAME, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_ACCOUNT_ID (or CLOUDFLARE_ACCOUNT_ID) are required when OBJECT_STORAGE_PROVIDER=r2',
      );
    }
    return createR2ObjectStorage({
      accountId,
      bucketName: env.R2_BUCKET_NAME,
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    });
  }

  if (env.OBJECT_STORAGE_PROVIDER === 's3') {
    if (
      !env.S3_BUCKET_NAME ||
      !env.S3_ACCESS_KEY_ID ||
      !env.S3_SECRET_ACCESS_KEY ||
      !env.S3_REGION
    ) {
      throw new Error(
        'S3_BUCKET_NAME, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, and S3_REGION are required when OBJECT_STORAGE_PROVIDER=s3',
      );
    }
    const commands = createS3ObjectCommands({
      bucketName: env.S3_BUCKET_NAME,
      region: env.S3_REGION,
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      endpoint: env.S3_ENDPOINT,
      forcePathStyle: env.S3_FORCE_PATH_STYLE,
    });
    return new R2ObjectStorageAdapter({ bucketName: env.S3_BUCKET_NAME }, commands);
  }

  if (env.OBJECT_STORAGE_PROVIDER !== 'inline') {
    throw new Error(`OBJECT_STORAGE_PROVIDER=${env.OBJECT_STORAGE_PROVIDER} is not implemented`);
  }

  return new InlineObjectStorage();
}
