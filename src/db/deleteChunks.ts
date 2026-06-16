import { getDatabase } from './connect.js';
import { TABLE_NAME } from './tableSchema.js';
import { logger } from '../utils/logger.js';

export async function deleteChunks(chunkIds: string[]): Promise<void> {
  if (!chunkIds.length) {
    return;
  }

  const db = await getDatabase();
  const table = await db.openTable(TABLE_NAME);

  const ids = chunkIds.map((id) => `'${id.replaceAll("'", "\\'")}'`);

  await table.delete(`id IN (${ids.join(', ')})`);

  logger.info('Deleted vectors', {
    count: chunkIds.length
  });
}
