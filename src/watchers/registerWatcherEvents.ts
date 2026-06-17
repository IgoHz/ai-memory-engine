import type { FSWatcher } from 'chokidar';
import type { ProjectsRegistry } from '../types/project.js';
import { beginReindex, finishReindex, isReindexing } from './reindexQueue.js';
import { indexerService } from '../indexer/';

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
      await indexerService.indexProject(registry, projectName);
    } finally {
      finishReindex(projectName);
    }
  };

  watcher.on('add', reindex);
  watcher.on('change', reindex);
  watcher.on('unlink', reindex);
}
