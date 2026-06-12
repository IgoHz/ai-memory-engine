import { ChunkStats } from '../types/chunk.js';
import type { MemoryChunk } from '../types/memoryChunk.js';

export function getChunkStats(
  rawChunks: MemoryChunk[],
  validChunks: MemoryChunk[]
): ChunkStats {
  const lengths = validChunks.map((chunk) => chunk.content.length);

  const averageChunkLength =
    lengths.length === 0
      ? 0
      : Math.round(
          lengths.reduce((sum, length) => sum + length, 0) / lengths.length
        );

  return {
    documents: new Set(rawChunks.map((chunk) => chunk.metadata.path)).size,

    rawChunks: rawChunks.length,

    validChunks: validChunks.length,

    removedChunks: rawChunks.length - validChunks.length,

    averageChunkLength,

    minChunkLength: lengths.length === 0 ? 0 : Math.min(...lengths),

    maxChunkLength: lengths.length === 0 ? 0 : Math.max(...lengths)
  };
}
