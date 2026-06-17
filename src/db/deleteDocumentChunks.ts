import { logger } from '../utils/logger.js';
import { Table } from '@lancedb/lancedb';

export async function deleteDocumentChunks(
  table: Table,
  path: string
): Promise<void> {
  await table.delete(`metadata.path = '${path.replaceAll("'", "\\'")}'`);

  logger.info('Deleted document vectors', {
    path
  });
}
