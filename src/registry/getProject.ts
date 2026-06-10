import { ProjectConfig, ProjectsRegistry } from '../types/project.js';

export function getProject(
  registry: ProjectsRegistry,
  projectName: string
): ProjectConfig {
  const project = registry.projects[projectName];

  if (!project) {
    throw new Error(`Unknown project: ${projectName}`);
  }

  return project;
}
