import { markdownFormatter } from '../formatters/MarkdownFormatter.js';
import { vectorRetriever } from '../retrievers/VectorRetriever.js';
import { SearchOptions, SearchResult } from '../domains/Search.js';

export class MemorySearch {
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
    const chunks = await vectorRetriever.vectorSearch(options.query, {
      limit: options.limit,
      minScore: options.minScore,
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
