import { MemoryMetadata } from './MemoryMetadata.js';

export interface MemoryDocument {
  content: string;

  metadata: MemoryMetadata;

  hash: string;

  updatedAt: string;
}
