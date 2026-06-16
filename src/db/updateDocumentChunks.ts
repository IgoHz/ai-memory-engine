import type { MemoryChunk } from '../types/memoryChunk.js';
import { addChunks } from './addChunks.js';
import { deleteDocumentChunks } from './deleteDocumentChunks.js';

export async function updateDocumentChunks(
  path: string,
  chunks: MemoryChunk[],
  embeddings: number[][]
): Promise<void> {
  if (!chunks.length) {
    return;
  }

  await deleteDocumentChunks(path);

  await addChunks(chunks, embeddings);
}
