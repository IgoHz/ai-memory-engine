import { projectRegistry } from '../config/ProjectRegistry.js';
import { ProjectsRegistry } from '../domains/Project.js';
import { createProjectDocuments } from '../normalizers/createProjectDocuments.js';
import { logger } from '../utils/logger.js';
import { createHash } from 'crypto';
import { MemoryDocument } from '../domains/MemoryDocument.js';
import { IndexState } from '../domains/IndexState.js';
import { indexStateRepository } from '../repositories/IndexStateRepository.js';
import { readFile } from 'fs/promises';
import { memoryChunker } from './MemoryChunker.js';
import { embeddingsProvider } from '../embeddings/EmbeddingsProvider.js';
import { memoryChunkRepository } from '../repositories/MemoryChunkRepository.js';

class IncrementalIndexer {
  async indexAllProjects(): Promise<void> {
    const registry = await projectRegistry.loadProjects();

    await Promise.all(
      Object.keys(registry.projects).map((projectName) =>
        this.indexProject(registry, projectName)
      )
    );
  }

  async indexProject(
    registry: ProjectsRegistry,
    projectName: string
  ): Promise<void> {
    logger.info('Starting indexing', {
      project: projectName
    });

    const state = await indexStateRepository.load();

    const documents = await createProjectDocuments(registry, projectName);

    const changedDocuments = await this.getChangedDocuments(documents, state);

    logger.info('Changed documents detected', {
      count: changedDocuments.length
    });

    await this.indexChangedDocuments(changedDocuments, state);

    await indexStateRepository.save(state);

    logger.info('Project indexing finished', {
      project: projectName
    });
  }

  private async indexDocuments(
    project: string,
    documents: MemoryDocument[]
  ): Promise<void> {
    for (const document of documents) {
      const chunks = await memoryChunker.createDocumentChunks([document]);

      const embeddings = await embeddingsProvider.generateEmbeddings(
        chunks.map((chunk) => chunk.content)
      );

      await memoryChunkRepository.updateDocumentChunks(
        project,
        document.metadata.filePath,
        chunks,
        embeddings
      );
    }
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

  private async getUnindexedFilesCount(
    documents: MemoryDocument[],
    state: IndexState
  ): Promise<number> {
    let count = 0;

    for (const document of documents) {
      if (await this.hasFileChanged(document.metadata.filePath, state)) {
        count++;
      }
    }

    return count;
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

    const embeddings = await embeddingsProvider.generateEmbeddings(
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
      hash: this.calculateFileHash(content),
      updatedAt: new Date().toISOString()
    };
  }

  calculateFileHash(content: string): string {
    return createHash('sha256').update(content).digest('hex');
  }
}

export const incrementalIndexer = new IncrementalIndexer();
