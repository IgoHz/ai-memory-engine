import { MemoryMetadata } from './MemoryMetadata.js';

export interface MemoryChunk {
  id: string;

  content: string;

  metadata: MemoryMetadata;
}
