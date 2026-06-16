import chokidar, { type FSWatcher } from 'chokidar';
import type { ProjectConfig } from '../types/project.js';

export function createProjectWatcher(project: ProjectConfig): FSWatcher {
  return chokidar.watch(`${project.memoryDir}/**/*.md`, {
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 500,
      pollInterval: 100
    }
  });
}
