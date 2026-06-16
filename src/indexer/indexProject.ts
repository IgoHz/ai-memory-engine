import type { ProjectsRegistry } from '../types/project.js';
import type { MemoryDocument } from '../types/memory.js';
import type { IndexState } from '../types/indexState.js';
import { createProjectDocuments } from '../normalizers/createProjectDocuments.js';
import { logger } from '../utils/index.js';
import { loadIndexState } from './loadIndexState.js';
import { saveIndexState } from './saveIndexState.js';
import { indexChangedDocuments } from './indexChangedDocuments.js';
import { hasFileChanged } from './hasFileChanged.js';

export async function indexProject(
  registry: ProjectsRegistry,
  projectName: string
): Promise<void> {
  logger.info('Starting indexing', {
    project: projectName
  });

  const state = await loadIndexState();

  const documents = await createProjectDocuments(registry, projectName);

  const changedDocuments = await getChangedDocuments(documents, state);

  logger.info('Changed documents detected', {
    count: changedDocuments.length
  });

  await indexChangedDocuments(changedDocuments, state);

  await saveIndexState(state);

  logger.info('Project indexing finished', {
    project: projectName
  });
}

async function getChangedDocuments(
  documents: MemoryDocument[],
  state: IndexState
): Promise<MemoryDocument[]> {
  const changedDocuments: MemoryDocument[] = [];

  for (const document of documents) {
    const changed = await hasFileChanged(document.metadata.filePath, state);

    if (changed) {
      changedDocuments.push(document);
    }
  }

  return changedDocuments;
}
