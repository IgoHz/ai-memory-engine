import { Table } from '@lancedb/lancedb';
import type { MemoryChunk } from '../types/memoryChunk.js';
import { logger } from '../utils/logger.js';
import { VectorRecord } from '../types/vectorRecord.js';
import { databaseConnectionService } from './DatabaseConnectionService.js';
import { projectTableService } from './ProjectTableService.js';

export const VECTOR_DIMENSIONS = 768;

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

    await this.deleteChunks(table, chunkIds);

    await this.addChunks(table, chunks, embeddings);
  }

  async getChunksTable(project: string) {
    return projectTableService.getProjectTable(project);
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

  private async deleteChunks(table: Table, chunkIds: string[]): Promise<void> {
    if (!chunkIds.length) {
      return;
    }

    const db = await databaseConnectionService.getDatabase();

    const ids = chunkIds.map((id) => `'${id.replaceAll("'", "\\'")}'`);

    await table.delete(`id IN (${ids.join(', ')})`);

    logger.info('Deleted vectors', {
      count: chunkIds.length
    });
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
}

export const vectorStoreService = new VectorStoreService();
