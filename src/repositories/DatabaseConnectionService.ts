import { Connection } from '@lancedb/lancedb';
import { logger } from '../utils/logger.js';
import * as lancedb from '@lancedb/lancedb';
import { PATHS } from '../config/paths.js';

let connection: Connection | null = null;

class DatabaseConnectionService {
  async getDatabase(): Promise<Connection> {
    if (!connection) {
      logger.info(`Connecting to LanceDB at "${PATHS.DB_DIR}"`);
      connection = await lancedb.connect(PATHS.DB_DIR);
    }

    return connection;
  }

  resetDatabase(): void {
    logger.info('Resetting LanceDB connection');
    connection = null;
  }
}

export const databaseConnectionService = new DatabaseConnectionService();
