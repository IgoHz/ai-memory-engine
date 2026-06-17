import { lancedbService } from '../db';
import { embeddingsService } from '../embeddings/EmbeddingsService.js';
import { filterByScore } from './filterByScore.js';
import { filterChunk } from './filterChunk.js';
import { mergeChunks } from './mergeChunks.js';
import type { RetrievedChunk, SearchOptions } from './types.js';

export async function vectorSearch(
  query: string,
  options: SearchOptions = {}
): Promise<RetrievedChunk[]> {
  if (!options.filters?.project) {
    throw new Error('Project filter is required');
  }

  const table = await lancedbService.getChunksTable(options.filters.project);

  const embedding = await embeddingsService.generateEmbedding(query);

  const results = await table.search(embedding).limit(100).toArray();

  const chunks = results.map(
    (result): RetrievedChunk => ({
      id: result.id,
      content: result.content,
      score: result._distance,
      metadata: result.metadata
    })
  );

  const metadataFiltered = chunks.filter((chunk) =>
    filterChunk(chunk, options.filters!)
  );

  const scoreFiltered = filterByScore(metadataFiltered, options.minScore);

  const merged = mergeChunks(scoreFiltered);

  return merged.slice(0, options.limit ?? 10);
}
