import { retrieverService } from '../retrievers';
import { contextFormatterService } from '../formatters';
import type { SearchResult, SearchOptions } from './types';

export class MemorySearchService {
  async search(options: SearchOptions): Promise<SearchResult> {
    return this.searchByType(undefined, options);
  }

  async searchAdr(options: SearchOptions): Promise<SearchResult> {
    return this.searchByType('adr', options);
  }

  async searchBug(options: SearchOptions): Promise<SearchResult> {
    return this.searchByType('bug', options);
  }

  async searchDecision(options: SearchOptions): Promise<SearchResult> {
    return this.searchByType('decision', options);
  }

  async searchSnippet(options: SearchOptions): Promise<SearchResult> {
    return this.searchByType('snippet', options);
  }

  private async searchByType(
    type: string | undefined,
    options: SearchOptions
  ): Promise<SearchResult> {
    const chunks = await retrieverService.vectorSearch(options.query, {
      limit: options.limit,
      minScore: options.minScore,
      filters: {
        project: options.project,
        type,
        tags: options.tags
      }
    });

    return {
      content: contextFormatterService.format(chunks),
      chunksFound: chunks.length
    };
  }
}
