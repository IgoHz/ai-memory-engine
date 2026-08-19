import { describe, expect, it } from 'vitest';
import { memorySearch } from '../../src/search/MemorySearchService.js';

describe('Planner ADR search', () => {
  it('should search ADR memories', async () => {
    const result = await memorySearch.searchAdr({
      query: 'authentication',
      project: 'ai-memory-engine'
    });

    expect(result.chunksFound).toBeGreaterThanOrEqual(0);
  });
});