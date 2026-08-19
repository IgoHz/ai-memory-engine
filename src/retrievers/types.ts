export interface FilterOptions {
  project?: string;
  type?: string;
  tags?: string[];
  path?: string;
  archived?: boolean;
  maxAgeDays?: number;
  relatedTo?: string[];
}

export interface RetrieverSearchOptions {
  limit?: number;
  maxDistance?: number;
  filters?: FilterOptions;
}

export interface MemoryChunkReader {
  getExistingChunksTable(project: string): Promise<import('@lancedb/lancedb').Table | null>;
  getExistingChunksTables(): Promise<import('@lancedb/lancedb').Table[]>;
}
