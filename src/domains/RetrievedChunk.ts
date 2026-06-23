import { MemoryMetadata } from './MemoryMetadata.js';

export interface RetrievedChunk {
  id: string;
  content: string;
  score: number;
  metadata: MemoryMetadata;
}
