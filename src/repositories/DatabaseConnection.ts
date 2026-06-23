import { Connection } from '@lancedb/lancedb';
import { logger } from '../utils/logger.js';
import * as lancedb from '@lancedb/lancedb';
import { env } from '../config/env.js';

let connection: Connection | null = null;

export class DatabaseConnection {
  static async getDatabase(): Promise<Connection> {
    if (!connection) {
      logger.info(`Connecting to LanceDB at "${env.DB_PATH}"`);
      connection = await lancedb.connect(env.DB_PATH);
    }

    return connection;
  }

  static resetDatabase(): void {
    logger.info('Resetting LanceDB connection');
    connection = null;
  }
}
