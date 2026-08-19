import { Table } from '@lancedb/lancedb';
import type { MemoryChunk } from '../domains/MemoryChunk.js';
import { logger } from '../utils/logger.js';
import { projectTableRepository } from './ProjectTableRepository.js';
import { VectorRecord } from './types.js';

export const VECTOR_DIMENSIONS = 768;

class MemoryChunkRepository {
  async updateDocumentChunks(
    project: string,
    path: string,
    chunks: MemoryChunk[],
    embeddings: number[][]
  ): Promise<void> {
    if (!chunks.length) {
      return;
    }

    logger.info('Opening table');

    const table = await this.getChunksTable(project);

    logger.info('Deleting existing chunks');

    await this.deleteDocumentChunks(table, path);

    logger.info('Adding chunks');

    await this.addChunks(table, chunks, embeddings);

    logger.info('Chunks added');
  }

  async getChunksTable(project: string) {
    return projectTableRepository.ensureProjectTable(project);
  }

  async getExistingChunksTable(project: string): Promise<Table | null> {
    const exists = await projectTableRepository.tableExists(project);

    if (!exists) {
      return null;
    }

    return projectTableRepository.getProjectTable(project);
  }

  private async deleteDocumentChunks(
    table: Table,
    path: string
  ): Promise<void> {
    await table.delete(`metadata.filePath = '${path.replaceAll("'", "\\'")}'`);

    logger.info('Deleted document vectors', {
      path
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

export const memoryChunkRepository = new MemoryChunkRepository();
