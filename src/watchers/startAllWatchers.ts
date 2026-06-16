import type { ProjectsRegistry } from '../types/project.js';
import { startProjectWatcher } from './startProjectWatcher.js';

export function startAllWatchers(registry: ProjectsRegistry): void {
  for (const projectName of Object.keys(registry.projects)) {
    startProjectWatcher(registry, projectName);
  }
}
