import type { MemoryMetadata } from '../types/memory.js';

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
