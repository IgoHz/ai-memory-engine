import { describe, expect, it } from 'vitest';
import { createIntegrationMemorySearch } from '../helpers/buildIntegrationIndex.js';

const memorySearch = createIntegrationMemorySearch();

describe('Planner tool simulation', () => {
  it('should answer planning questions from memory', async () => {
    const result = await memorySearch.search({
      query: 'How are embeddings stored?',
      project: 'ai-memory-engine'
    });

    expect(result.chunksFound).toBeGreaterThan(0);

    expect(result.content.toLowerCase()).toContain('lancedb');
  });

  it('should answer questions about indexing', async () => {
    const result = await memorySearch.search({
      query: 'How are changed files detected?',
      project: 'ai-memory-engine'
    });

    expect(result.chunksFound).toBeGreaterThan(0);
  });

  it('should answer architecture questions', async () => {
    const result = await memorySearch.search({
      query: 'Which vector database is used?',
      project: 'ai-memory-engine'
    });

    expect(result.chunksFound).toBeGreaterThan(0);
  });
});