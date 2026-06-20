import chokidar, { type FSWatcher } from 'chokidar';
import type { ProjectConfig } from '../types/project.js';
import type { ProjectsRegistry } from '../types/project.js';
import { logger } from '../utils/logger.js';
import { indexerService } from '../indexing/IndexerService.js';

class WatchersService {
  private activeProjects: Set<string>;

  constructor() {
    this.activeProjects = new Set<string>();
  }

  startAllWatchers(registry: ProjectsRegistry): void {
    for (const projectName of Object.keys(registry.projects)) {
      this.startProjectWatcher(registry, projectName);
    }
  }

  private startProjectWatcher(
    registry: ProjectsRegistry,
    projectName: string
  ): void {
    const project = registry.projects[projectName];

    const watcher = this.createProjectWatcher(project);

    this.registerWatcherEvents(watcher, registry, projectName);

    logger.info('Watcher started', {
      project: projectName
    });
  }

  private createProjectWatcher(project: ProjectConfig): FSWatcher {
    return chokidar.watch(`${project.memoryDir}/**/*.md`, {
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 500,
        pollInterval: 100
      }
    });
  }

  private registerWatcherEvents(
    watcher: FSWatcher,
    registry: ProjectsRegistry,
    projectName: string
  ): void {
    const reindex = async () => {
      if (this.isReindexing(projectName)) {
        return;
      }

      this.beginReindex(projectName);

      try {
        await indexerService.indexProject(registry, projectName);
      } finally {
        this.finishReindex(projectName);
      }
    };

    watcher.on('add', reindex);
    watcher.on('change', reindex);
    watcher.on('unlink', reindex);
  }

  private isReindexing(projectName: string): boolean {
    return this.activeProjects.has(projectName);
  }

  private beginReindex(projectName: string): void {
    this.activeProjects.add(projectName);
  }

  private finishReindex(projectName: string): void {
    this.activeProjects.delete(projectName);
  }
}

export const watchersService = new WatchersService();
