import { registryService } from '../config/RegistryService.js';
import { ProjectsRegistry } from '../types/project.js';
import { createProjectDocuments } from '../normalizers/createProjectDocuments.js';
import { logger } from '../utils/logger.js';
import { createHash } from 'crypto';
import { MemoryDocument } from '../types/memory.js';
import { IndexState } from '../types/indexState.js';
import { indexStateService } from '../repositories/IndexStateService.js';
import { readFile } from 'fs/promises';
import { chunkersService } from './ChunkersService.js';
import { embeddingsService } from '../embeddings/EmbeddingsService.js';
import { vectorStoreService } from '../repositories/VectorStoreService.js';

class IndexerService {
  async indexAllProjects(): Promise<void> {
    const registry = await registryService.loadProjects();

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

    const state = await indexStateService.load();

    const documents = await createProjectDocuments(registry, projectName);

    const changedDocuments = await this.getChangedDocuments(documents, state);

    logger.info('Changed documents detected', {
      count: changedDocuments.length
    });

    await this.indexChangedDocuments(changedDocuments, state);

    await indexStateService.save(state);

    logger.info('Project indexing finished', {
      project: projectName
    });
  }

  private async indexDocuments(
    project: string,
    documents: MemoryDocument[]
  ): Promise<void> {
    for (const document of documents) {
      const chunks = await chunkersService.createDocumentChunks([document]);

      const embeddings = await embeddingsService.generateEmbeddings(
        chunks.map((chunk) => chunk.content)
      );

      await vectorStoreService.updateDocumentChunks(
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
    const chunks = await chunkersService.createDocumentChunks([document]);

    const embeddings = await embeddingsService.generateEmbeddings(
      chunks.map((chunk) => chunk.content)
    );

    await vectorStoreService.updateDocumentChunks(
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

export const indexerService = new IndexerService();
