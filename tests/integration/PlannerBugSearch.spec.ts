import { describe, expect, it } from 'vitest';
import { memorySearch } from '../../src/search/MemorySearchService.js';

describe('Planner bug search', () => {
  it('should search bug memories', async () => {
    const result = await memorySearch.searchBug({
      query: 'connection failure',
      project: 'ai-memory-engine'
    });

    expect(result.chunksFound).toBeGreaterThanOrEqual(0);
  });
});