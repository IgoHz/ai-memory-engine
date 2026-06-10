import path from 'node:path';
import { glob } from 'glob';
import type { ProjectsRegistry } from '../types/project.js';
import type { MemoryFile } from '../types/file.js';
import { getProject } from '../registry/getProject.js';

export async function discoverFiles(
  registry: ProjectsRegistry,
  projectName: string
): Promise<MemoryFile[]> {
  const project = getProject(registry, projectName);

  const memoryRoot = path.join(project.root, project.memoryDir);

  const absolutePaths = await glob('**/*.md', {
    cwd: memoryRoot,
    absolute: true
  });

  absolutePaths.sort();

  return absolutePaths.map((absolutePath) => ({
    project: projectName,
    absolutePath,
    relativePath: path.relative(memoryRoot, absolutePath)
  }));
}
