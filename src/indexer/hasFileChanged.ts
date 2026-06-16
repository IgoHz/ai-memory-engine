import type { IndexState } from '../types/indexState.js';
import { calculateFileHash } from './calculateFileHash.js';

export async function hasFileChanged(
  filePath: string,
  state: IndexState
): Promise<boolean> {
  const indexedFile = state[filePath];

  if (!indexedFile) {
    return true;
  }

  const currentHash = await calculateFileHash(filePath);

  return currentHash !== indexedFile.hash;
}
