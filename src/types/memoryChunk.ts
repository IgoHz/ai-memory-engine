import type { MemoryMetadata } from './memory.js';

export interface MemoryChunk {
  id: string;

  content: string;

  metadata: MemoryMetadata;
}
