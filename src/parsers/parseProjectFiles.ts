import type { ProjectsRegistry } from '../types/project.js';
import type { ParsedMemoryFile } from '../types/parsedMemoryFile.js';
import { parseFrontmatters } from './parseFrontmatters.js';
import { loadersService } from '../services';

export async function parseProjectFiles(
  registry: ProjectsRegistry,
  projectName: string
): Promise<ParsedMemoryFile[]> {
  const files = await loadersService.loadProjectFiles(registry, projectName);

  return parseFrontmatters(files);
}
