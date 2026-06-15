import type { MemoryMetadata } from './memory.js';

export interface VectorRecord extends Record<string, unknown> {
  id: string;

  vector: number[];

  content: string;

  metadata: MemoryMetadata;
}
