export interface MemorySearchOptions {
  query: string;
  project: string;
  limit?: number;
  maxDistance?: number;
  tags?: string[];
  path?: string;
  includeArchived?: boolean;
  maxAgeDays?: number;
  relatedTo?: string[];
}

export interface MemorySearchResult {
  content: string;
  chunksFound: number;
}
