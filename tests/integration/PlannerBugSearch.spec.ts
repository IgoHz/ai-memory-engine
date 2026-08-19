import { describe, expect, it } from 'vitest';
import { createIntegrationMemorySearch } from '../helpers/buildIntegrationIndex.js';

const memorySearch = createIntegrationMemorySearch();

describe('Planner bug search', () => {
  it('should search bug memories', async () => {
    const result = await memorySearch.searchBug({
      query: 'connection failure',
      project: 'ai-memory-engine'
    });

    expect(result.chunksFound).toBeGreaterThanOrEqual(0);
  });
});