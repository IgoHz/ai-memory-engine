import { describe, expect, it } from 'vitest';
import type { VectorRecord } from '../../src/repositories/types.js';
import MemoryChunkRepository from '../../src/repositories/MemoryChunkRepository.js';
import { MemoryDuplicateService } from '../../src/search/MemoryDuplicateService.js';

const metadata = (filePath: string) => ({
  project: 'demo',
  filePath,
  tags: [],
  importance: 0,
  archived: false,
  relatedTo: []
});

describe('MemoryDuplicateService', () => {
  it('reports highly similar records from different files', async () => {
    const records: VectorRecord[] = [
      { id: 'one', vector: [1, 0], content: 'one', metadata: metadata('one.md') },
      { id: 'two', vector: [0.99, 0.01], content: 'two', metadata: metadata('two.md') },
      { id: 'three', vector: [0, 1], content: 'three', metadata: metadata('three.md') }
    ];
    const repository = {
      getProjectRecords: async () => records
    } as unknown as MemoryChunkRepository;

    const result = await new MemoryDuplicateService(repository).findDuplicates(
      'demo',
      0.99
    );

    expect(result).toHaveLength(1);
    expect(result[0].left.path).toBe('one.md');
    expect(result[0].right.path).toBe('two.md');
    expect(result[0].similarity).toBeGreaterThan(0.99);
  });
});
