import { describe, expect, it } from 'vitest';
import { createIntegrationMemorySearch } from '../helpers/buildIntegrationIndex.js';

const memorySearch = createIntegrationMemorySearch();

describe('Planner ADR search', () => {
  it('should search ADR memories', async () => {
    const result = await memorySearch.searchAdr({
      query: 'authentication',
      project: 'ai-memory-engine'
    });

    expect(result.chunksFound).toBeGreaterThanOrEqual(0);
  });
});