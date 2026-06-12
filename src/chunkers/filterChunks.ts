import type { MemoryChunk } from '../types/memoryChunk';

const MIN_CHUNK_LENGTH = 50;
const MAX_WHITESPACE_RATIO = 0.8;
const MIN_WORD_COUNT = 5;

export function filterChunks(chunks: MemoryChunk[]): MemoryChunk[] {
  const validChunks = chunks.filter(isValidChunk);

  return removeDuplicateChunks(validChunks);
}

function isValidChunk(chunk: MemoryChunk): boolean {
  const content = chunk.content.trim();

  if (!content) {
    return false;
  }

  if (content.length < MIN_CHUNK_LENGTH) {
    return false;
  }

  if (getWordCount(content) < MIN_WORD_COUNT) {
    return false;
  }

  if (getWhitespaceRatio(content) > MAX_WHITESPACE_RATIO) {
    return false;
  }

  if (isHeadingOnly(content)) {
    return false;
  }

  return true;
}

function getWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function getWhitespaceRatio(text: string): number {
  if (!text.length) {
    return 1;
  }

  const whitespaceCharacters = (text.match(/\s/g) ?? []).length;

  return whitespaceCharacters / text.length;
}

function isHeadingOnly(text: string): boolean {
  const lines = text.trim().split('\n').filter(Boolean);

  if (lines.length !== 1) {
    return false;
  }

  return /^#+\s/.test(lines[0]);
}

function removeDuplicateChunks(chunks: MemoryChunk[]): MemoryChunk[] {
  const seen = new Set<string>();

  return chunks.filter((chunk) => {
    const normalized = chunk.content.trim();

    if (seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);

    return true;
  });
}
