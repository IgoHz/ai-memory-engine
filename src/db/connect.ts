import * as lancedb from '@lancedb/lancedb';
import type { Connection } from '@lancedb/lancedb';
import { DATABASE_PATH } from '../config/database.js';
import { logger } from '../utils/logger.js';

let connection: Connection | null = null;

export async function getDatabase(): Promise<Connection> {
  if (!connection) {
    logger.info(`Connecting to LanceDB at "${DATABASE_PATH}"`);
    connection = await lancedb.connect(DATABASE_PATH);
  }

  return connection;
}

export function resetDatabase(): void {
  logger.info('Resetting LanceDB connection');
  connection = null;
}
