import type { MemoryMetadata } from '../domains/MemoryMetadata.js';

export interface RetrievedChunk {
  id: string;
  content: string;
  score: number;
  metadata: MemoryMetadata;
}

export interface FilterOptions {
  project?: string;
  type?: string;
  tags?: string[];
  path?: string;
}

export interface SearchOptions {
  limit?: number;
  minScore?: number;
  filters?: FilterOptions;
}
