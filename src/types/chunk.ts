import type { MemoryChunk } from './memoryChunk.js';

export interface ChunkStats {
  documents: number;

  rawChunks: number;

  validChunks: number;

  removedChunks: number;

  averageChunkLength: number;

  minChunkLength: number;

  maxChunkLength: number;
}

export interface ChunkingResult {
  chunks: MemoryChunk[];

  stats: ChunkStats;
}
