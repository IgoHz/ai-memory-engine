import type { Table } from '@lancedb/lancedb';
import { logger } from '../utils/logger.js';
import type { MemoryChunk } from '../types/memoryChunk.js';
import { mapChunkToRecord } from './mapChunkToRecord.js';

export async function addChunks(
  table: Table,
  chunks: MemoryChunk[],
  embeddings: number[][]
): Promise<void> {
  if (!chunks.length) {
    return;
  }

  if (chunks.length !== embeddings.length) {
    throw new Error('Chunks count does not match embeddings count');
  }

  const records = chunks.map((chunk, index) =>
    mapChunkToRecord(chunk, embeddings[index])
  );

  await table.add(records);

  logger.info('Inserted vectors', {
    count: records.length
  });
}
