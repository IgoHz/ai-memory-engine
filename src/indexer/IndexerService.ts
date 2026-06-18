import { registryService } from '../registry';
import { ProjectsRegistry } from '../types/project';
import { createProjectDocuments } from '../normalizers/createProjectDocuments';
import { logger } from '../utils/logger';
import { createHash } from 'crypto';
import { MemoryDocument } from '../types/memory';
import { IndexState } from '../types/indexState';
import { chunkersService } from '../chunkers';
import { embeddingsService } from '../embeddings';
import { lancedbService } from '../db';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const INDEX_STATE_PATH = './db/indexState.json';

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

    const state = await this.loadIndexState();

    const documents = await createProjectDocuments(registry, projectName);

    const changedDocuments = await this.getChangedDocuments(documents, state);

    logger.info('Changed documents detected', {
      count: changedDocuments.length
    });

    await this.indexChangedDocuments(changedDocuments, state);

    await this.saveIndexState(state);

    logger.info('Project indexing finished', {
      project: projectName
    });
  }

  private async loadIndexState(): Promise<IndexState> {
    try {
      const content = await readFile(INDEX_STATE_PATH, 'utf8');

      return JSON.parse(content) as IndexState;
    } catch {
      return {};
    }
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

      await lancedbService.updateDocumentChunks(
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

    await lancedbService.updateDocumentChunks(
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
    state[document.metadata.filePath] = {
      hash: await this.calculateFileHash(document.metadata.filePath),
      updatedAt: new Date().toISOString()
    };
  }

  calculateFileHash(content: string): string {
    return createHash('sha256').update(content).digest('hex');
  }

  private async saveIndexState(state: IndexState): Promise<void> {
    await mkdir(dirname(INDEX_STATE_PATH), {
      recursive: true
    });

    await writeFile(INDEX_STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
  }

  private async indexStateExists(): Promise<boolean> {
    try {
      await access(INDEX_STATE_PATH);

      return true;
    } catch {
      return false;
    }
  }
}

export const indexerService = new IndexerService();
