import type { MemoryMetadata } from '../types/memory.js';

export interface RetrievedChunk {
  id: string;
  content: string;
  score: number;
  metadata: MemoryMetadata;
}

export interface SearchOptions {
  limit?: number;
}

export interface SearchResponse {
  chunks: RetrievedChunk[];
}

export interface FilterOptions {
  project?: string;
  type?: string;
  tags?: string[];
  path?: string;
}

export interface SearchOptions {
  limit?: number;
  filters?: FilterOptions;
}
