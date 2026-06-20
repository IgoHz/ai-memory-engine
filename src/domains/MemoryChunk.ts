import { MemoryMetadata } from './MemoryMetadata';

export interface MemoryChunk {
  id: string;

  content: string;

  metadata: MemoryMetadata;
}
