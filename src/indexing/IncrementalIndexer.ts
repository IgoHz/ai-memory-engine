import { ProjectsRegistry } from '../domains/Project.js';
import { createProjectDocuments } from '../normalizers/createProjectDocuments.js';
import { logger } from '../utils/logger.js';
import { createHash } from 'crypto';
import { MemoryDocument } from '../domains/MemoryDocument.js';
import { IndexState } from '../domains/IndexState.js';
import { readFile } from 'fs/promises';
import { memoryChunker } from './MemoryChunker.js';
import { ProjectRegistry } from '../config/ProjectRegistry.js';
import { projectRegistry } from '../config/registry.js';
import { IEmbeddingsProvider } from '../embeddings/types.js';
import { embeddingsProvider } from '../embeddings/EmbeddingsProvider.js';
import path from 'node:path';
import { IndexStateRepository, indexStateRepository } from '../repositories/IndexStateRepository.js';
import MemoryChunkRepository, { memoryChunkRepository } from '../repositories/MemoryChunkRepository.js';

export class IncrementalIndexer {
  constructor(
    private readonly projectRegistry: ProjectRegistry,
    private readonly embeddingsProvider: IEmbeddingsProvider,
    private readonly stateRepository: IndexStateRepository = indexStateRepository,
    private readonly chunkRepository: MemoryChunkRepository = memoryChunkRepository
  ) {}

  async indexAllProjects(): Promise<void> {
    const registry = await this.projectRegistry.loadProjects();

    const state = await this.stateRepository.load();

    for (const projectName of Object.keys(registry.projects)) {
      await this.indexProjectInternal(registry, projectName, state);
    }

    await this.stateRepository.save(state);
  }

  async indexProject(
    registry: ProjectsRegistry,
    projectName: string
  ): Promise<void> {
    const state = await this.stateRepository.load();

    await this.indexProjectInternal(registry, projectName, state);

    await this.stateRepository.save(state);
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

    await this.removeDeletedDocuments(registry, projectName, documents, state);

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
        document.sourcePath,
        state
      );

      if (changed) {
        changedDocuments.push(document);
      }
    }

    return changedDocuments;
  }

  private async hasFileChanged(
    sourcePath: string,
    state: IndexState
  ): Promise<boolean> {
    const indexedFile = state[sourcePath];

    if (!indexedFile) {
      return true;
    }

    const currentHash = await this.calculateFileHash(sourcePath);

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

  private async removeDeletedDocuments(
    registry: ProjectsRegistry,
    projectName: string,
    documents: MemoryDocument[],
    state: IndexState
  ): Promise<void> {
    const project = this.projectRegistry.getProject(registry, projectName);
    const memoryRoot = path.resolve(process.cwd(), project.memoryDir);
    const currentPaths = new Set(documents.map((document) => document.sourcePath));

    for (const sourcePath of Object.keys(state)) {
      if (!sourcePath.startsWith(memoryRoot) || currentPaths.has(sourcePath)) {
        continue;
      }

      const relativePath = path.relative(memoryRoot, sourcePath);
      await this.chunkRepository.deleteDocumentChunksForProject(
        projectName,
        relativePath
      );
      delete state[sourcePath];
    }
  }

  private async indexDocument(document: MemoryDocument): Promise<void> {
    const chunks = await memoryChunker.createDocumentChunks([document]);

    const embeddings = await this.embeddingsProvider.generateEmbeddings(
      chunks.map((chunk) => chunk.content)
    );

    await this.chunkRepository.updateDocumentChunks(
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
    const content = await readFile(document.sourcePath, 'utf8');
    state[document.sourcePath] = {
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
