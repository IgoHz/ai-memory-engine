import { Table } from '@lancedb/lancedb';
import type { MemoryChunk } from '../domains/MemoryChunk.js';
import { logger } from '../utils/logger.js';
import { projectTableRepository } from './ProjectTableRepository.js';
import { VectorRecord } from './types.js';

export const VECTOR_DIMENSIONS = 768;

export default class MemoryChunkRepository {
  constructor(
    private readonly tableRepository = projectTableRepository
  ) {}

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

  async deleteDocumentChunksForProject(
    project: string,
    path: string
  ): Promise<void> {
    const table = await this.getExistingChunksTable(project);

    if (!table) {
      return;
    }

    await this.deleteDocumentChunks(table, path);
  }

  async getChunksTable(project: string) {
    return this.tableRepository.ensureProjectTable(project);
  }

  async getExistingChunksTable(project: string): Promise<Table | null> {
    const exists = await this.tableRepository.tableExists(project);

    if (!exists) {
      return null;
    }

    return this.tableRepository.getProjectTable(project);
  }

  async getExistingChunksTables(): Promise<Table[]> {
    return this.tableRepository.getExistingProjectTables();
  }

  async getProjectRecords(project: string): Promise<VectorRecord[]> {
    const table = await this.getExistingChunksTable(project);

    if (!table) {
      return [];
    }

    return (await table
      .query()
      .select(['id', 'content', 'metadata'])
      .toArray()) as VectorRecord[];
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
