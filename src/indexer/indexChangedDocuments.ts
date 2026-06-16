import type { MemoryDocument } from '../types/memory.js';
import type { IndexState } from '../types/indexState.js';
import { indexDocument } from './indexDocument.js';
import { updateIndexState } from './updateIndexState.js';

export async function indexChangedDocuments(
  documents: MemoryDocument[],
  state: IndexState
): Promise<void> {
  for (const document of documents) {
    await indexDocument(document);

    await updateIndexState(state, document);
  }
}
