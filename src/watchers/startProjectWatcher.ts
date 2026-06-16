import type { ProjectsRegistry } from '../types/project.js';
import { createProjectWatcher } from './createProjectWatcher.js';
import { registerWatcherEvents } from './registerWatcherEvents.js';
import { logger } from '../utils/index.js';

export function startProjectWatcher(
  registry: ProjectsRegistry,
  projectName: string
): void {
  const project = registry.projects[projectName];

  const watcher = createProjectWatcher(project);

  registerWatcherEvents(watcher, registry, projectName);

  logger.info('Watcher started', {
    project: projectName
  });
}
