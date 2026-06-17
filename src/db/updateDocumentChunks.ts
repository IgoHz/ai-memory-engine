import type { MemoryChunk } from '../types/memoryChunk.js';
import { addChunks } from './addChunks.js';
import { deleteDocumentChunks } from './deleteDocumentChunks.js';
import { getChunksTable } from './getChunksTable.js';

export async function updateDocumentChunks(
  project: string,
  path: string,
  chunks: MemoryChunk[],
  embeddings: number[][]
): Promise<void> {
  if (!chunks.length) {
    return;
  }
  const table = await getChunksTable(project);

  await deleteDocumentChunks(table, path);

  await addChunks(table, chunks, embeddings);
}
