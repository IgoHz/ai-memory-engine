import { EmbeddingsProvider } from '../embeddings/EmbeddingsProvider.js';
import { IncrementalIndexer } from '../indexing/IncrementalIndexer.js';
import { MemoryArchiver } from '../writing/MemoryArchiver.js';
import { MemoryWriter } from '../writing/MemoryWriter.js';
import { ProjectSummarizer } from '../writing/ProjectSummarizer.js';
import { DatabaseConnection } from '../repositories/DatabaseConnection.js';
import { IndexStateRepository } from '../repositories/IndexStateRepository.js';
import MemoryChunkRepository from '../repositories/MemoryChunkRepository.js';
import { ProjectTableRepository } from '../repositories/ProjectTableRepository.js';
import { VectorRetriever } from '../retrievers/VectorRetriever.js';
import { MemorySearch } from '../search/MemorySearchService.js';
import { MemoryRelationshipService } from '../search/MemoryRelationshipService.js';
import { MemoryDuplicateService } from '../search/MemoryDuplicateService.js';
import { projectRegistry } from '../config/registry.js';

export function createApplication() {
  const database = new DatabaseConnection();
  const tables = new ProjectTableRepository(database);
  const chunks = new MemoryChunkRepository(tables);
  const embeddings = new EmbeddingsProvider();
  const state = new IndexStateRepository();
  const indexer = new IncrementalIndexer(projectRegistry, embeddings, state, chunks);
  const retriever = new VectorRetriever(chunks, embeddings);
  const search = new MemorySearch(retriever);
  const relationships = new MemoryRelationshipService(chunks);
  const duplicates = new MemoryDuplicateService(chunks);
  const writer = new MemoryWriter(projectRegistry);
  const archiver = new MemoryArchiver(projectRegistry);
  const summarizer = new ProjectSummarizer(projectRegistry);

  return {
    projectRegistry,
    database,
    tables,
    chunks,
    embeddings,
    state,
    indexer,
    retriever,
    search,
    relationships,
    duplicates,
    writer,
    archiver,
    summarizer
  };
}
