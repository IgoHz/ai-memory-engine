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

    const table = await memoryChunkRepository.getChunksTable(
      options.filters.project
    );

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

    const scoreFiltered = this.filterByScore(
      metadataFiltered,
      options.minScore
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

  private filterByScore(
    chunks: RetrievedChunk[],
    minScore = 0.35
  ): RetrievedChunk[] {
    return chunks.filter((chunk) => chunk.score <= minScore);
  }

  private mergeChunks(chunks: RetrievedChunk[]): RetrievedChunk[] {
    if (chunks.length === 0) {
      return [];
    }

    const merged: RetrievedChunk[] = [];

    for (const chunk of chunks) {
      const previous = merged.at(-1);

      if (previous && previous.metadata.filePath === chunk.metadata.filePath) {
        previous.content += '\n\n' + chunk.content;
        previous.score = Math.min(previous.score, chunk.score);

        continue;
      }

      merged.push({
        ...chunk
      });
    }

    return merged;
  }
}

export const vectorRetriever = new VectorRetriever();
