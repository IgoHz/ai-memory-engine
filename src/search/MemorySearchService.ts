import { markdownFormatter } from '../formatters/MarkdownFormatter.js';
import { vectorRetriever, VectorRetriever } from '../retrievers/VectorRetriever.js';
import type { MemoryChunkReader } from '../retrievers/types.js';
import type { IEmbeddingsProvider } from '../embeddings/types.js';
import { MemorySearchOptions, MemorySearchResult } from './types.js';

export class MemorySearch {
  constructor(private readonly retriever: VectorRetriever = vectorRetriever) {}

  static create(
    chunkRepository: MemoryChunkReader,
    embeddingProvider: IEmbeddingsProvider
  ): MemorySearch {
    return new MemorySearch(
      new VectorRetriever(chunkRepository, embeddingProvider)
    );
  }

  async search(options: MemorySearchOptions): Promise<MemorySearchResult> {
    return this.searchByType(undefined, options);
  }

  async searchAdr(options: MemorySearchOptions): Promise<MemorySearchResult> {
    return this.searchByType('adr', options);
  }

  async searchBug(options: MemorySearchOptions): Promise<MemorySearchResult> {
    return this.searchByType('bug', options);
  }

  async searchDecision(
    options: MemorySearchOptions
  ): Promise<MemorySearchResult> {
    return this.searchByType('decision', options);
  }

  async searchSnippet(
    options: MemorySearchOptions
  ): Promise<MemorySearchResult> {
    return this.searchByType('snippet', options);
  }

  private async searchByType(
    type: string | undefined,
    options: MemorySearchOptions
  ): Promise<MemorySearchResult> {
    const chunks = await this.retriever.vectorSearch(options.query, {
      limit: options.limit,
      maxDistance: options.maxDistance,
      filters: {
        project: options.project,
        type,
        tags: options.tags,
        path: options.path,
        archived: options.includeArchived ? undefined : false,
        maxAgeDays: options.maxAgeDays,
        relatedTo: options.relatedTo
      }
    });

    return {
      content: markdownFormatter.formatContext(chunks),
      chunksFound: chunks.length
    };
  }
}

export const memorySearch = new MemorySearch();
