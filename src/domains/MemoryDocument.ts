import { MemoryMetadata } from './MemoryMetadata.js';

export interface MemoryDocument {
  content: string;

  metadata: MemoryMetadata;

  sourcePath: string;

  hash: string;

  updatedAt: string;
}
