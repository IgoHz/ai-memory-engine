import type { MemoryChunk } from '../types/memoryChunk.js';
import { addChunks } from './addChunks.js';
import { deleteChunks } from './deleteChunks.js';

export async function updateChunks(
  chunks: MemoryChunk[],
  embeddings: number[][]
): Promise<void> {
  if (!chunks.length) {
    return;
  }

  const chunkIds = chunks.map((chunk) => chunk.id);

  await deleteChunks(chunkIds);

  await addChunks(chunks, embeddings);
}
