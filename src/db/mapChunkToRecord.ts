import type { MemoryChunk } from '../types/memoryChunk.js';
import type { VectorRecord } from '../types/vectorRecord.js';

export function mapChunkToRecord(
  chunk: MemoryChunk,
  embedding: number[]
): VectorRecord {
  return {
    id: chunk.id,

    vector: embedding,

    content: chunk.content,

    metadata: chunk.metadata
  };
}
