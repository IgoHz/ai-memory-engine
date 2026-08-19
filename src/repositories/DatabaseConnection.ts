import { Connection } from '@lancedb/lancedb';
import { logger } from '../utils/logger.js';
import * as lancedb from '@lancedb/lancedb';
import { env } from '../config/env.js';

export class DatabaseConnection {
  private connection: Connection | null = null;

  constructor(private readonly databasePath = env.DB_PATH) {}

  async getDatabase(): Promise<Connection> {
    if (!this.connection) {
      logger.info(`Connecting to LanceDB at "${this.databasePath}"`);
      this.connection = await lancedb.connect(this.databasePath);
    }

    return this.connection;
  }

  resetDatabase(): void {
    logger.info('Resetting LanceDB connection');
    this.connection = null;
  }
}
