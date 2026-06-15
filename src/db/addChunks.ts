import type { Table } from '@lancedb/lancedb';
import { getDatabase } from './connect.js';
import { TABLE_NAME } from './tableSchema.js';
import { logger } from '../utils/logger.js';
import type { MemoryChunk } from '../types/memoryChunk.js';
import { mapChunkToRecord } from './mapChunkToRecord.js';

export async function addChunks(
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

  const db = await getDatabase();

  let table: Table;
  let newlyCreated = false;

  try {
    table = await db.openTable(TABLE_NAME);
  } catch {
    logger.info('Creating LanceDB table');

    table = await db.createTable(TABLE_NAME, records);

    newlyCreated = true;
  }

  if (!newlyCreated) {
    await table.add(records);
  }

  logger.info('Inserted vectors', {
    count: records.length
  });
}
