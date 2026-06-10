import type { ProjectsRegistry } from '../types/project.js';
import type { RawMemoryFile } from '../types/rawMemoryFile.js';
import { discoverFiles } from './discoverFiles.js';
import { loadFiles } from './loadFiles.js';

export async function loadProjectFiles(
  registry: ProjectsRegistry,
  projectName: string
): Promise<RawMemoryFile[]> {
  const files = await discoverFiles(registry, projectName);

  return loadFiles(files);
}
