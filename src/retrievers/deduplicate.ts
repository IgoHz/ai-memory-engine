import type { RetrievedChunk } from '../domains/RetrievedChunk.js';

const NEAR_DUPLICATE_THRESHOLD = 0.9;

export function removeNearDuplicates(
  chunks: RetrievedChunk[]
): RetrievedChunk[] {
  const kept: RetrievedChunk[] = [];

  for (const chunk of chunks) {
    if (kept.some((existing) => areNearDuplicates(existing, chunk))) {
      continue;
    }

    kept.push(chunk);
  }

  return kept;
}

function areNearDuplicates(left: RetrievedChunk, right: RetrievedChunk): boolean {
  const leftTokens = new Set(tokenize(left.content));
  const rightTokens = new Set(tokenize(right.content));

  if (!leftTokens.size || !rightTokens.size) {
    return false;
  }

  const intersection = [...leftTokens].filter((token) => rightTokens.has(token));
  const union = new Set([...leftTokens, ...rightTokens]);

  return intersection.length / union.size >= NEAR_DUPLICATE_THRESHOLD;
}

function tokenize(content: string): string[] {
  return content
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}
