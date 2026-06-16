import type { MemoryDocument } from '../types/memory.js';
import type { IndexState } from '../types/indexState.js';
import { hasFileChanged } from './hasFileChanged.js';

export async function getUnindexedFilesCount(
  documents: MemoryDocument[],
  state: IndexState
): Promise<number> {
  let count = 0;

  for (const document of documents) {
    if (await hasFileChanged(document.metadata.filePath, state)) {
      count++;
    }
  }

  return count;
}
