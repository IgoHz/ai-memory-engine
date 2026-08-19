import { markdownFormatter } from '../formatters/MarkdownFormatter.js';
import { vectorRetriever } from '../retrievers/VectorRetriever.js';
import { MemorySearchOptions, MemorySearchResult } from './types.js';

export class MemorySearch {
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
    const chunks = await vectorRetriever.vectorSearch(options.query, {
      limit: options.limit,
      maxDistance: options.maxDistance,
      filters: {
        project: options.project,
        type,
        tags: options.tags
      }
    });

    return {
      content: markdownFormatter.formatContext(chunks),
      chunksFound: chunks.length
    };
  }
}

export const memorySearch = new MemorySearch();
