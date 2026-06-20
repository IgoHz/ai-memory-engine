import { Connection } from '@lancedb/lancedb';
import { logger } from '../utils/logger.js';
import { DatabaseConnection } from './DatabaseConnection.js';

class ProjectTableRepository {
  async getOrCreateProjectTable(db: Connection, project: string) {
    const tableName = this.getProjectTableName(project);

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

  async getProjectTable(project: string) {
    const db = await DatabaseConnection.getDatabase();

    return this.getOrCreateProjectTable(db, project);
  }

  private getProjectTableName(project: string): string {
    return `memory_chunks_${project}`;
  }
}

export const projectTableRepository = new ProjectTableRepository();
