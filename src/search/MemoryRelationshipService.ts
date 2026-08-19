import type { RetrievedChunk } from '../domains/RetrievedChunk.js';
import type MemoryChunkRepository from '../repositories/MemoryChunkRepository.js';

export class MemoryRelationshipService {
  constructor(private readonly chunkRepository: MemoryChunkRepository) {}

  async findRelated(
    project: string,
    relation: string,
    limit = 20
  ): Promise<RetrievedChunk[]> {
    if (!relation.trim()) {
      return [];
    }

    const records = await this.chunkRepository.getProjectRecords(project);
    const chunks = records
      .filter((record) => record.metadata.relatedTo?.includes(relation))
      .map((record) => ({
        id: record.id,
        content: record.content,
        score: 0,
        metadata: {
          ...record.metadata,
          importance: record.metadata.importance ?? 0,
          archived: record.metadata.archived ?? false,
          relatedTo: record.metadata.relatedTo ?? []
        }
      }));

    return chunks.slice(0, limit);
  }
}
