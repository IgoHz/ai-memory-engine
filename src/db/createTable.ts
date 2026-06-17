import type { Connection } from '@lancedb/lancedb';
import { logger } from '../utils/index.js';
import { getProjectTableName } from './getProjectTableName.js';

export async function createTable(db: Connection, project: string) {
  const tableName = getProjectTableName(project);

  const tableNames = await db.tableNames();

  if (tableNames.includes(tableName)) {
    logger.info('Opening table', {
      table: tableName
    });

    return db.openTable(tableName);
  }

  logger.info('Creating table', {
    table: tableName
  });

  return db.createTable(tableName, []);
}
