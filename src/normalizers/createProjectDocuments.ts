import type { ProjectsRegistry } from '../types/project.js';
import type { MemoryDocument } from '../types/memory.js';
import { parseProjectFiles } from '../parsers/parseProjectFiles.js';
import { createMemoryDocuments } from './createMemoryDocuments.js';

export async function createProjectDocuments(
  registry: ProjectsRegistry,
  projectName: string
): Promise<MemoryDocument[]> {
  const files = await parseProjectFiles(registry, projectName);

  return createMemoryDocuments(files);
}
