export interface MemorySearchOptions {
  query: string;
  project: string;
  limit?: number;
  maxDistance?: number;
  tags?: string[];
}

export interface MemorySearchResult {
  content: string;
  chunksFound: number;
}
