export interface SearchOptions {
  query: string;
  project: string;
  limit?: number;
  minScore?: number;
  tags?: string[];
}

export interface SearchResult {
  content: string;
  chunksFound: number;
}
