import { MemoryMetadata } from './MemoryMetadata';

export interface MemoryDocument {
  content: string;

  metadata: MemoryMetadata;

  hash: string;

  updatedAt: string;
}
