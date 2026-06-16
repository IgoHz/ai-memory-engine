import { getDatabase } from './connect.js';
import { TABLE_NAME } from './tableSchema.js';
import { logger } from '../utils/logger.js';

export async function deleteDocumentChunks(path: string): Promise<void> {
  const db = await getDatabase();
  const table = await db.openTable(TABLE_NAME);

  await table.delete(`metadata.path = '${path.replaceAll("'", "\\'")}'`);

  logger.info('Deleted document vectors', {
    path
  });
}
