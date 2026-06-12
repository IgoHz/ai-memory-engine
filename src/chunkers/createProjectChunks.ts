import type { MemoryDocument } from '../types/memory.js';
import type { MemoryChunk } from '../types/memoryChunk.js';

import { createDocumentChunks } from './createDocumentChunks.js';
import { filterChunks } from './filterChunks.js';

export async function createProjectChunks(
  documents: MemoryDocument[]
): Promise<MemoryChunk[]> {
  const chunks = await createDocumentChunks(documents);

  return filterChunks(chunks);
}
