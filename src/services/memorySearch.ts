import { vectorSearch } from '../retrievers/index.js';
import { contextFormatter } from '../formatters/ContextFormatterService.js';
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
  const chunks = await vectorSearch(options.query, {
    limit: options.limit,
    minScore: options.minScore,
    filters: {
      project: options.project,
      ...options.filters
    }
  });

  return {
    content: contextFormatter.format(chunks),
    chunksFound: chunks.length
  };
}
