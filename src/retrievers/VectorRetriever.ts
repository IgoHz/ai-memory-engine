import { FilterOptions, RetrieverSearchOptions } from './types.js';
import { memoryChunkRepository } from '../repositories/MemoryChunkRepository.js';
import { embeddingsProvider } from '../embeddings/EmbeddingsProvider.js';
import { RetrievedChunk } from '../domains/RetrievedChunk.js';

class VectorRetriever {
  async vectorSearch(
    query: string,
    options: RetrieverSearchOptions = {}
  ): Promise<RetrievedChunk[]> {
    if (!options.filters?.project) {
      throw new Error('Project filter is required');
    }

    const table = await memoryChunkRepository.getExistingChunksTable(
      options.filters.project
    );

    if (!table) {
      return [];
    }

    const embedding = await embeddingsProvider.generateEmbedding(query);

    const results = await table.search(embedding).limit(100).toArray();

    const chunks = results.map(
      (result): RetrievedChunk => ({
        id: result.id,
        content: result.content,
        score: result._distance,
        metadata: result.metadata
      })
    );

    const metadataFiltered = chunks.filter((chunk) =>
      this.filterChunk(chunk, options.filters!)
    );

    const scoreFiltered = this.filterByDistance(
      metadataFiltered,
      options.maxDistance
    );

    const merged = this.mergeChunks(scoreFiltered);

    return merged.slice(0, options.limit ?? 10);
  }

  private filterChunk(chunk: RetrievedChunk, filters: FilterOptions): boolean {
    return (
      this.matchesProject(chunk, filters.project) &&
      this.matchesType(chunk, filters.type) &&
      this.matchesTags(chunk, filters.tags) &&
      this.matchesPath(chunk, filters.path)
    );
  }

  private matchesPath(chunk: RetrievedChunk, path?: string): boolean {
    if (!path) {
      return true;
    }

    return chunk.metadata.filePath === path;
  }

  private matchesProject(chunk: RetrievedChunk, project?: string): boolean {
    if (!project) {
      return true;
    }

    return chunk.metadata.project === project;
  }

  private matchesTags(chunk: RetrievedChunk, tags?: string[]): boolean {
    if (!tags?.length) {
      return true;
    }

    return tags.every((tag) => chunk.metadata.tags.includes(tag));
  }

  private matchesType(chunk: RetrievedChunk, type?: string): boolean {
    if (!type) {
      return true;
    }

    return chunk.metadata.type === type;
  }

  private filterByDistance(
    chunks: RetrievedChunk[],
    maxDistance = 0.35
  ): RetrievedChunk[] {
    return chunks.filter((chunk) => chunk.score <= maxDistance);
  }

  private mergeChunks(chunks: RetrievedChunk[]): RetrievedChunk[] {
    const grouped = new Map<string, RetrievedChunk>();

    for (const chunk of chunks) {
      const key = chunk.metadata.filePath;

      const existing = grouped.get(key);

      if (!existing) {
        grouped.set(key, {
          ...chunk
        });

        continue;
      }

      existing.content += '\n\n' + chunk.content;
      existing.score = Math.min(existing.score, chunk.score);
    }

    return [...grouped.values()];
  }
}

export const vectorRetriever = new VectorRetriever();
