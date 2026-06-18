import { contextFormatterService } from '../formatters/ContextFormatterService.js';
import { retrieverService } from '../retrievers/RetrieversService.js';
import type { FilterOptions } from '../retrievers/types.js';

export interface MemorySearchOptions {
  query: string;
  project: string;
  limit?: number;
  minScore?: number;
  filters?: Omit<FilterOptions, 'project'>;
}

export interface MemorySearchResult {
  content: string;
  chunksFound: number;
}

export async function memorySearch(
  options: MemorySearchOptions
): Promise<MemorySearchResult> {
  const chunks = await retrieverService.vectorSearch(options.query, {
    limit: options.limit,
    minScore: options.minScore,
    filters: {
      project: options.project,
      ...options.filters
    }
  });

  return {
    content: contextFormatterService.format(chunks),
    chunksFound: chunks.length
  };
}
