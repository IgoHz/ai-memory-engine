import { describe, expect, it } from 'vitest';
import { memorySearch } from '../../src/search/MemorySearchService.js';

describe('Planner memory search', () => {
  it('should retrieve project memories', async () => {
    const result = await memorySearch.search({
      query: 'jwt refresh tokens',
      project: 'ai-memory-engine'
    });

    expect(result.content).toBeDefined();
    expect(result.content.length).toBeGreaterThan(0);
    expect(result.chunksFound).toBeGreaterThan(0);
  });

  it('should respect project isolation', async () => {
    const result = await memorySearch.search({
      query: 'jwt refresh tokens',
      project: 'unknown-project'
    });

    expect(result.chunksFound).toBe(0);
  });

  it('should respect limit', async () => {
    const result = await memorySearch.search({
      query: 'jwt refresh tokens',
      project: 'ai-memory-engine',
      limit: 2
    });

    expect(result.chunksFound).toBeLessThanOrEqual(2);
  });

  it('should support tags', async () => {
    const result = await memorySearch.search({
      query: 'authentication',
      project: 'ai-memory-engine',
      tags: ['auth']
    });

    expect(result.content).toBeDefined();
  });

  it('should support score filtering', async () => {
    const result = await memorySearch.search({
      query: 'authentication',
      project: 'ai-memory-engine',
      maxDistance: 0.7
    });

    expect(result.content).toBeDefined();
  });
});