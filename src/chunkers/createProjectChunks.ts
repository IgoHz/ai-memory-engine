import type { MemoryDocument } from '../types/memory.js';
import { createDocumentChunks } from './createDocumentChunks.js';
import { filterChunks } from './filterChunks.js';
import { getChunkStats } from './getChunkStats.js';
import { ChunkingResult } from '../types/chunk.js';

export async function createProjectChunks(
  documents: MemoryDocument[]
): Promise<ChunkingResult> {
  const rawChunks = await createDocumentChunks(documents);

  const chunks = filterChunks(rawChunks);

  const stats = getChunkStats(rawChunks, chunks);

  return {
    chunks,
    stats
  };
}
