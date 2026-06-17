import { SearchOptions, SearchResponse } from './types.js';
import { vectorSearch } from './vectorSearch.js';

export async function retrieveContext(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResponse> {
  const chunks = await vectorSearch(query, options);

  return {
    chunks
  };
}
