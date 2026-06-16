import type { FSWatcher } from 'chokidar';
import type { ProjectsRegistry } from '../types/project.js';
import { logger } from '../utils/index.js';
import { indexProject } from '../indexer/indexProject.js';
import { beginReindex, finishReindex, isReindexing } from './reindexQueue.js';

export function registerWatcherEvents(
  watcher: FSWatcher,
  registry: ProjectsRegistry,
  projectName: string
): void {
  const reindex = async () => {
    if (isReindexing(projectName)) {
      return;
    }

    beginReindex(projectName);

    try {
      await indexProject(registry, projectName);
    } finally {
      finishReindex(projectName);
    }
  };

  watcher.on('add', reindex);
  watcher.on('change', reindex);
  watcher.on('unlink', reindex);
}
