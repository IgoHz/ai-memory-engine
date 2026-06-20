export interface MemorySearchOptions {
  query: string;
  project: string;
  limit?: number;
  minScore?: number;
  tags?: string[];
}

export interface MemorySearchResult {
  content: string;
  chunksFound: number;
}
