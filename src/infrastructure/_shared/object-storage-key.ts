import type { ObjectStorageKey } from '../../ports/storage/iobject-storage.port.js';

export function objectStorageKeyPath(key: ObjectStorageKey): string {
  return key.segments.join('/');
}
