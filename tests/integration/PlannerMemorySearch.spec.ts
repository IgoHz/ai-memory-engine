import { describe, expect, it } from 'vitest';
import { createIntegrationMemorySearch } from '../helpers/buildIntegrationIndex.js';

const memorySearch = createIntegrationMemorySearch();

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

  it('should search across all indexed projects', async () => {
    const result = await memorySearch.search({
      query: 'authentication',
      project: '*'
    });

    expect(result.chunksFound).toBeGreaterThan(0);
    expect(result.content).toContain('client-a');
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

  it('should support path filtering', async () => {
    const result = await memorySearch.search({
      query: 'architecture',
      project: 'ai-memory-engine',
      path: 'architecture.md'
    });

    expect(result.chunksFound).toBeGreaterThan(0);
  });

  it('should exclude archived memories unless requested', async () => {
    const activeResult = await memorySearch.search({
      query: 'legacy archive sentinel workflow',
      project: 'ai-memory-engine',
      path: 'archived-memory.md'
    });
    const archivedResult = await memorySearch.search({
      query: 'legacy archive sentinel workflow',
      project: 'ai-memory-engine',
      path: 'archived-memory.md',
      includeArchived: true
    });

    expect(activeResult.chunksFound).toBe(0);
    expect(archivedResult.chunksFound).toBeGreaterThan(0);
  });

  it('should support an age filter', async () => {
    const result = await memorySearch.search({
      query: 'jwt refresh tokens',
      project: 'ai-memory-engine',
      maxAgeDays: 365
    });

    expect(result.chunksFound).toBeGreaterThan(0);
  });

  it('should filter by relationships', async () => {
    const result = await memorySearch.searchAdr({
      query: 'vector storage',
      project: 'ai-memory-engine',
      relatedTo: ['decision:vector-storage']
    });

    expect(result.chunksFound).toBeGreaterThan(0);
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