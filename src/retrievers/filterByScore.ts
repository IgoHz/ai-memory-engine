import type { RetrievedChunk } from './types.js';

export function filterByScore(
  chunks: RetrievedChunk[],
  minScore = 0.35
): RetrievedChunk[] {
  return chunks.filter((chunk) => chunk.score <= minScore);
}
