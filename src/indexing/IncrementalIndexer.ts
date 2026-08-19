import { ProjectsRegistry } from '../domains/Project.js';
import { createProjectDocuments } from '../normalizers/createProjectDocuments.js';
import { logger } from '../utils/logger.js';
import { createHash } from 'crypto';
import { MemoryDocument } from '../domains/MemoryDocument.js';
import { IndexState } from '../domains/IndexState.js';
import { indexStateRepository } from '../repositories/IndexStateRepository.js';
import { readFile } from 'fs/promises';
import { memoryChunker } from './MemoryChunker.js';
import { memoryChunkRepository } from '../repositories/MemoryChunkRepository.js';
import { ProjectRegistry } from '../config/ProjectRegistry.js';
import { projectRegistry } from '../config/registry.js';
import { IEmbeddingsProvider } from '../embeddings/types.js';
import { embeddingsProvider } from '../embeddings/EmbeddingsProvider.js';

export class IncrementalIndexer {
  constructor(
    private readonly projectRegistry: ProjectRegistry,
    private readonly embeddingsProvider: IEmbeddingsProvider
  ) {}

  async indexAllProjects(): Promise<void> {
    const registry = await this.projectRegistry.loadProjects();

    const state = await indexStateRepository.load();

    for (const projectName of Object.keys(registry.projects)) {
      await this.indexProjectInternal(registry, projectName, state);
    }

    await indexStateRepository.save(state);
  }

  async indexProject(
    registry: ProjectsRegistry,
    projectName: string
  ): Promise<void> {
    const state = await indexStateRepository.load();

    await this.indexProjectInternal(registry, projectName, state);

    await indexStateRepository.save(state);
  }

  private async indexProjectInternal(
    registry: ProjectsRegistry,
    projectName: string,
    state: IndexState
  ): Promise<void> {
    logger.info('Starting indexing', {
      project: projectName
    });

    const documents = await createProjectDocuments(registry, projectName);

    logger.info('Documents loaded', {
      project: projectName,
      count: documents.length
    });

    const changedDocuments = await this.getChangedDocuments(documents, state);

    logger.info('Changed documents detected', {
      count: changedDocuments.length
    });

    await this.indexChangedDocuments(changedDocuments, state);

    logger.info('Project indexing finished', {
      project: projectName
    });
  }

  private async getChangedDocuments(
    documents: MemoryDocument[],
    state: IndexState
  ): Promise<MemoryDocument[]> {
    const changedDocuments: MemoryDocument[] = [];

    for (const document of documents) {
      const changed = await this.hasFileChanged(
        document.metadata.filePath,
        state
      );

      if (changed) {
        changedDocuments.push(document);
      }
    }

    return changedDocuments;
  }

  private async hasFileChanged(
    filePath: string,
    state: IndexState
  ): Promise<boolean> {
    const indexedFile = state[filePath];

    if (!indexedFile) {
      return true;
    }

    const currentHash = await this.calculateFileHash(filePath);

    return currentHash !== indexedFile.hash;
  }

  private async indexChangedDocuments(
    documents: MemoryDocument[],
    state: IndexState
  ): Promise<void> {
    for (const document of documents) {
      await this.indexDocument(document);

      await this.updateIndexState(state, document);
    }
  }

  private async indexDocument(document: MemoryDocument): Promise<void> {
    const chunks = await memoryChunker.createDocumentChunks([document]);

    const embeddings = await this.embeddingsProvider.generateEmbeddings(
      chunks.map((chunk) => chunk.content)
    );

    await memoryChunkRepository.updateDocumentChunks(
      document.metadata.project,
      document.metadata.filePath,
      chunks,
      embeddings
    );
  }

  private async updateIndexState(
    state: IndexState,
    document: MemoryDocument
  ): Promise<void> {
    const content = await readFile(document.metadata.filePath, 'utf8');
    state[document.metadata.filePath] = {
      hash: this.calculateContentHash(content),
      updatedAt: new Date().toISOString()
    };
  }

  private async calculateFileHash(filePath: string): Promise<string> {
    const content = await readFile(filePath, 'utf8');

    return this.calculateContentHash(content);
  }

  private calculateContentHash(content: string): string {
    return createHash('sha256').update(content).digest('hex');
  }
}

export const incrementalIndexer = new IncrementalIndexer(
  projectRegistry,
  embeddingsProvider
);
