import chokidar, { type FSWatcher } from 'chokidar';
import type { ProjectConfig } from '../domains/Project.js';
import type { ProjectsRegistry } from '../domains/Project.js';
import { logger } from '../utils/logger.js';
import { IncrementalIndexer, incrementalIndexer } from '../indexing/IncrementalIndexer.js';

export class MemoryWatcher {
  private readonly activeProjects = new Set<string>();
  private readonly watchers = new Map<string, FSWatcher>();

  constructor(private readonly indexer: IncrementalIndexer = incrementalIndexer) {}

  startAllWatchers(registry: ProjectsRegistry): void {
    for (const projectName of Object.keys(registry.projects)) {
      if (this.watchers.has(projectName)) {
        continue;
      }

      this.startProjectWatcher(registry, projectName);
    }
  }

  async stopAllWatchers(): Promise<void> {
    const closing = [...this.watchers.values()].map((watcher) => watcher.close());

    await Promise.all(closing);
    this.watchers.clear();
    this.activeProjects.clear();
  }

  private startProjectWatcher(
    registry: ProjectsRegistry,
    projectName: string
  ): void {
    const project = registry.projects[projectName];

    const watcher = this.createProjectWatcher(project);

    this.watchers.set(projectName, watcher);

    this.registerWatcherEvents(watcher, registry, projectName);

    logger.info('Watcher started', {
      project: projectName
    });
  }

  private createProjectWatcher(project: ProjectConfig): FSWatcher {
    return chokidar.watch(project.memoryDir, {
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
        await this.indexer.indexProject(registry, projectName);
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

export const memoryWatcher = new MemoryWatcher();
