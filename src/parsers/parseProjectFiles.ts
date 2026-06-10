import type { ProjectsRegistry } from '../types/project.js';
import type { ParsedMemoryFile } from '../types/parsedMemoryFile.js';
import { loadProjectFiles } from '../loaders/loadProjectFiles.js';
import { parseFrontmatters } from './parseFrontmatters.js';

export async function parseProjectFiles(
  registry: ProjectsRegistry,
  projectName: string
): Promise<ParsedMemoryFile[]> {
  const files = await loadProjectFiles(registry, projectName);

  return parseFrontmatters(files);
}
