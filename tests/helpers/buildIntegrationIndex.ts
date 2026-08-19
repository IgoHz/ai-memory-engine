import path from 'node:path';
import { rm } from 'node:fs/promises';
import { IncrementalIndexer } from '../../src/indexing/IncrementalIndexer.js';
import { ProjectRegistry } from '../../src/config/ProjectRegistry.js';
import { TestEmbeddingsProvider } from '../mocks/TestEmbeddingsProvider.js';
import { MemorySearch } from '../../src/search/MemorySearchService.js';
import { memoryChunkRepository } from '../../src/repositories/MemoryChunkRepository.js';

export async function buildIntegrationIndex() {
  await rm(
    path.resolve(process.cwd(), 'db'),
    {
      recursive: true,
      force: true
    }
  );

  const registry = new ProjectRegistry(
    path.resolve(
      process.cwd(),
      'tests/fixtures/projects.test.yaml'
    )
  );

  const embeddingsProvider = new TestEmbeddingsProvider();

  const indexer = new IncrementalIndexer(
    registry,
    embeddingsProvider
  );

  await indexer.indexAllProjects();
}

export function createIntegrationMemorySearch(): MemorySearch {
  return MemorySearch.create(memoryChunkRepository, new TestEmbeddingsProvider());
}