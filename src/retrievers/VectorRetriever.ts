import { FilterOptions, RetrieverSearchOptions } from './types.js';
import { memoryChunkRepository } from '../repositories/MemoryChunkRepository.js';
import { embeddingsProvider } from '../embeddings/EmbeddingsProvider.js';
import { RetrievedChunk } from '../domains/RetrievedChunk.js';
import type { IEmbeddingsProvider } from '../embeddings/types.js';
import type { MemoryChunkReader } from './types.js';
import { removeNearDuplicates } from './deduplicate.js';

export class VectorRetriever {
  constructor(
    private readonly chunkRepository: MemoryChunkReader = memoryChunkRepository,
    private readonly embeddingProvider: IEmbeddingsProvider = embeddingsProvider
  ) {}

  async vectorSearch(
    query: string,
    options: RetrieverSearchOptions = {}
  ): Promise<RetrievedChunk[]> {
    if (!options.filters?.project) {
      throw new Error('Project filter is required');
    }

    const tables =
      options.filters.project === '*'
        ? await this.chunkRepository.getExistingChunksTables()
        : [
            await this.chunkRepository.getExistingChunksTable(
              options.filters.project
            )
          ];

    if (!tables.some((table) => table !== null)) {
      return [];
    }

    const embedding = await this.embeddingProvider.generateEmbedding(query);

    const results = (
      await Promise.all(
        tables
          .filter((table): table is NonNullable<typeof table> => table !== null)
          .map((table) => table.search(embedding).limit(100).toArray())
      )
    ).flat();

    const chunks = results.map(
      (result): RetrievedChunk => ({
        id: result.id,
        content: result.content,
        score: result._distance,
        metadata: {
          ...result.metadata,
          importance: result.metadata.importance ?? 0,
          archived: result.metadata.archived ?? false,
          relatedTo: result.metadata.relatedTo ?? []
        }
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

    return removeNearDuplicates(this.rankChunks(merged)).slice(
      0,
      options.limit ?? 10
    );
  }

  private filterChunk(chunk: RetrievedChunk, filters: FilterOptions): boolean {
    return (
      this.matchesProject(chunk, filters.project) &&
      this.matchesType(chunk, filters.type) &&
      this.matchesTags(chunk, filters.tags) &&
      this.matchesPath(chunk, filters.path) &&
      this.matchesArchived(chunk, filters.archived) &&
      this.matchesAge(chunk, filters.maxAgeDays) &&
      this.matchesRelatedTo(chunk, filters.relatedTo)
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

    return project === '*' || chunk.metadata.project === project;
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

  private matchesArchived(
    chunk: RetrievedChunk,
    archived?: boolean
  ): boolean {
    return archived === undefined || chunk.metadata.archived === archived;
  }

  private matchesAge(chunk: RetrievedChunk, maxAgeDays?: number): boolean {
    if (maxAgeDays === undefined || !chunk.metadata.updatedAt) {
      return true;
    }

    const updatedAt = Date.parse(chunk.metadata.updatedAt);

    if (Number.isNaN(updatedAt)) {
      return true;
    }

    const ageInDays = (Date.now() - updatedAt) / (24 * 60 * 60 * 1000);

    return ageInDays <= maxAgeDays;
  }

  private matchesRelatedTo(
    chunk: RetrievedChunk,
    relatedTo?: string[]
  ): boolean {
    if (!relatedTo?.length) {
      return true;
    }

    return relatedTo.every((relation) => chunk.metadata.relatedTo.includes(relation));
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
      const key = `${chunk.metadata.project}:${chunk.metadata.filePath}`;

      const existing = grouped.get(key);

      if (!existing) {
        grouped.set(key, {
          ...chunk
        });

        continue;
      }

      existing.content += '\n\n' + chunk.content;
      existing.score = Math.min(existing.score, chunk.score);
      existing.metadata.importance = Math.max(
        existing.metadata.importance,
        chunk.metadata.importance
      );
      existing.metadata.archived = existing.metadata.archived && chunk.metadata.archived;
      existing.metadata.relatedTo = [
        ...new Set([...existing.metadata.relatedTo, ...chunk.metadata.relatedTo])
      ];
    }

    return [...grouped.values()];
  }

  private rankChunks(chunks: RetrievedChunk[]): RetrievedChunk[] {
    return chunks.sort(
      (left, right) =>
        this.rankScore(left) - this.rankScore(right) ||
        right.metadata.importance - left.metadata.importance
    );
  }

  private rankScore(chunk: RetrievedChunk): number {
    return chunk.score - chunk.metadata.importance * 0.1;
  }
}

export const vectorRetriever = new VectorRetriever();
