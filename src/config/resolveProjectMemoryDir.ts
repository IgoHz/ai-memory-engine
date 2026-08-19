import path from 'node:path';
import type { ProjectConfig } from '../domains/Project.js';

export function resolveProjectMemoryDir(
  project: ProjectConfig,
  workingDirectory = process.cwd()
): string {
  return path.resolve(workingDirectory, project.memoryDir);
}