import { MemoryMetadata } from './MemoryMetadata';

export interface RetrievedChunk {
  id: string;
  content: string;
  score: number;
  metadata: MemoryMetadata;
}
