import type { RetrievedChunk } from './types.js';

export function mergeChunks(chunks: RetrievedChunk[]): RetrievedChunk[] {
  if (chunks.length === 0) {
    return [];
  }

  const merged: RetrievedChunk[] = [];

  for (const chunk of chunks) {
    const previous = merged.at(-1);

    if (previous && previous.metadata.filePath === chunk.metadata.filePath) {
      previous.content += '\n\n' + chunk.content;
      previous.score = Math.min(previous.score, chunk.score);

      continue;
    }

    merged.push({
      ...chunk
    });
  }

  return merged;
}
