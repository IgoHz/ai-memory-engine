import { describe, expect, it } from 'vitest';
import { removeNearDuplicates } from '../../src/retrievers/deduplicate.js';
import type { RetrievedChunk } from '../../src/domains/RetrievedChunk.js';

const metadata = {
  project: 'demo',
  filePath: 'memory.md',
  tags: [],
  importance: 0,
  archived: false,
  relatedTo: []
};

describe('removeNearDuplicates', () => {
  it('keeps the first highly similar result and preserves distinct results', () => {
    const chunks: RetrievedChunk[] = [
      { id: 'one', content: 'Use LanceDB for vector storage.', score: 0.1, metadata },
      { id: 'two', content: 'Use LanceDB for vector storage!', score: 0.2, metadata },
      { id: 'three', content: 'Use Ollama for embedding generation.', score: 0.3, metadata }
    ];

    expect(removeNearDuplicates(chunks).map((chunk) => chunk.id)).toEqual([
      'one',
      'three'
    ]);
  });
});
