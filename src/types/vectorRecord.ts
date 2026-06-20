import type { MemoryMetadata } from '../domains/MemoryMetadata.js';

export interface VectorRecord extends Record<string, unknown> {
  id: string;

  vector: number[];

  content: string;

  metadata: MemoryMetadata;
}
