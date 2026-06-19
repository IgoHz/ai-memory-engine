import { Connection, Table } from '@lancedb/lancedb';
import type { MemoryChunk } from '../types/memoryChunk.js';
import { logger } from '../utils/logger.js';
import * as lancedb from '@lancedb/lancedb';
import { DATABASE_PATH } from '../config/database.js';
import { VectorRecord } from '../types/vectorRecord.js';

export const TABLE_NAME = 'memory_chunks';
export const VECTOR_DIMENSIONS = 768;

let connection: Connection | null = null;

class VectorStoreService {
  async updateDocumentChunks(
    project: string,
    path: string,
    chunks: MemoryChunk[],
    embeddings: number[][]
  ): Promise<void> {
    if (!chunks.length) {
      return;
    }
    const table = await this.getChunksTable(project);

    await this.deleteDocumentChunks(table, path);

    await this.addChunks(table, chunks, embeddings);
  }

  private async updateChunks(
    table: Table,
    chunks: MemoryChunk[],
    embeddings: number[][]
  ): Promise<void> {
    if (!chunks.length) {
      return;
    }

    const chunkIds = chunks.map((chunk) => chunk.id);

    await this.deleteChunks(chunkIds);

    await this.addChunks(table, chunks, embeddings);
  }

  async getChunksTable(project: string) {
    return this.getProjectTable(project);
  }

  private async getProjectTable(project: string) {
    const db = await this.getDatabase();

    return db.openTable(this.getProjectTableName(project));
  }

  private async deleteDocumentChunks(
    table: Table,
    path: string
  ): Promise<void> {
    await table.delete(`metadata.path = '${path.replaceAll("'", "\\'")}'`);

    logger.info('Deleted document vectors', {
      path
    });
  }

  private async deleteChunks(chunkIds: string[]): Promise<void> {
    if (!chunkIds.length) {
      return;
    }

    const db = await this.getDatabase();
    const table = await db.openTable(TABLE_NAME);

    const ids = chunkIds.map((id) => `'${id.replaceAll("'", "\\'")}'`);

    await table.delete(`id IN (${ids.join(', ')})`);

    logger.info('Deleted vectors', {
      count: chunkIds.length
    });
  }

  private async createTable(db: Connection, project: string) {
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

  private getProjectTableName(project: string): string {
    return `memory_chunks_${project}`;
  }

  private async addChunks(
    table: Table,
    chunks: MemoryChunk[],
    embeddings: number[][]
  ): Promise<void> {
    if (!chunks.length) {
      return;
    }

    if (chunks.length !== embeddings.length) {
      throw new Error('Chunks count does not match embeddings count');
    }

    const records = chunks.map((chunk, index) =>
      this.mapChunkToRecord(chunk, embeddings[index])
    );

    await table.add(records);

    logger.info('Inserted vectors', {
      count: records.length
    });
  }

  private mapChunkToRecord(
    chunk: MemoryChunk,
    embedding: number[]
  ): VectorRecord {
    return {
      id: chunk.id,

      vector: embedding,

      content: chunk.content,

      metadata: chunk.metadata
    };
  }

  private async countVectors(): Promise<number> {
    const db = await this.getDatabase();

    const table = await db.openTable(TABLE_NAME);

    return table.countRows();
  }

  private async getDatabase(): Promise<Connection> {
    if (!connection) {
      logger.info(`Connecting to LanceDB at "${DATABASE_PATH}"`);
      connection = await lancedb.connect(DATABASE_PATH);
    }

    return connection;
  }

  private resetDatabase(): void {
    logger.info('Resetting LanceDB connection');
    connection = null;
  }
}

export const vectorStoreService = new VectorStoreService();
