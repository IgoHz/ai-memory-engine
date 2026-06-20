import type { ProjectsRegistry } from '../domains/Project.js';
import type { ParsedMemoryFile } from '../types/parsedMemoryFile.js';
import { parseFrontmatters } from './parseFrontmatters.js';
import { fileLoader } from '../indexing/FileLoader.js';

export async function parseProjectFiles(
  registry: ProjectsRegistry,
  projectName: string
): Promise<ParsedMemoryFile[]> {
  const files = await fileLoader.loadProjectFiles(registry, projectName);

  return parseFrontmatters(files);
}
