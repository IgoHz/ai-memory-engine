import type { ProjectsRegistry } from '../types/project.js';
import { createProjectDocuments } from '../normalizers/createProjectDocuments.js';
import { indexDocument } from './indexDocument.js';
import { logger } from '../utils/index.js';

export async function indexProject(
  registry: ProjectsRegistry,
  projectName: string
): Promise<void> {
  logger.info('Starting indexing', {
    project: projectName
  });

  const documents = await createProjectDocuments(registry, projectName);

  for (const document of documents) {
    await indexDocument(document);
  }

  logger.info('Project indexing finished', {
    project: projectName
  });
}
