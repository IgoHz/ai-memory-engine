import { Connection, Table } from '@lancedb/lancedb';
import { logger } from '../utils/logger.js';
import { DatabaseConnection } from './DatabaseConnection.js';
import { VectorRecord } from './types.js';
import { env } from '../config/env.js';

export class ProjectTableRepository {
  constructor(
    private readonly databaseConnection = new DatabaseConnection(env.DB_PATH)
  ) {}

  async tableExists(project: string): Promise<boolean> {
    const db = await this.databaseConnection.getDatabase();

    const tableName = this.getProjectTableName(project);

    const tableNames = await db.tableNames();

    return tableNames.includes(tableName);
  }

  async getProjectTable(project: string): Promise<Table> {
    const db = await this.databaseConnection.getDatabase();

    const tableName = this.getProjectTableName(project);

    logger.info('Opening table', {
      table: tableName
    });

    return db.openTable(tableName);
  }

  async getExistingProjectTables(): Promise<Table[]> {
    const db = await this.databaseConnection.getDatabase();
    const tableNames = await db.tableNames();
    const projectTableNames = tableNames.filter((name) =>
      name.startsWith('memory_chunks_')
    );

    return Promise.all(projectTableNames.map((name) => db.openTable(name)));
  }

  async ensureProjectTable(project: string): Promise<Table> {
    const db = await this.databaseConnection.getDatabase();

    return this.ensureProjectTableForDatabase(db, project);
  }

  async ensureProjectTableForDatabase(
    db: Connection,
    project: string
  ): Promise<Table> {
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

    const bootstrapRecord: VectorRecord = {
      id: '__bootstrap__',

      vector: new Array(768).fill(0),

      content: '',

      metadata: {
        project,
        filePath: '',
        title: '',
        tags: ['__bootstrap__'],
        importance: 0,
        archived: false,
        relatedTo: ['__bootstrap__'],
        updatedAt: '',
        type: ''
      }
    };

    const table = await db.createTable(tableName, [bootstrapRecord]);

    await table.delete("id = '__bootstrap__'");

    return table;
  }

  private getProjectTableName(project: string): string {
    return `memory_chunks_${project}`;
  }
}

export const projectTableRepository = new ProjectTableRepository();
