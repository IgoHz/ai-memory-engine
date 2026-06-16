import { loadProjects } from '../registry/loadProjects.js';
import { indexProject } from './indexProject.js';

export async function indexAllProjects(): Promise<void> {
  const registry = await loadProjects();

  await Promise.all(
    Object.keys(registry.projects).map((projectName) =>
      indexProject(registry, projectName)
    )
  );
}
