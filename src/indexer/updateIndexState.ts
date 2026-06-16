import type { IndexState } from '../types/indexState.js';
import type { MemoryDocument } from '../types/memory.js';
import { calculateFileHash } from './calculateFileHash.js';

export async function updateIndexState(
  state: IndexState,
  document: MemoryDocument
): Promise<void> {
  state[document.metadata.filePath] = {
    hash: await calculateFileHash(document.metadata.filePath),
    updatedAt: new Date().toISOString()
  };
}
