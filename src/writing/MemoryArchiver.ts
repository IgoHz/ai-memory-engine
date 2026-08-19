import path from 'node:path';
import { glob } from 'glob';
import matter from 'gray-matter';
import { readFile, stat, writeFile } from 'node:fs/promises';
import type { ProjectConfig, ProjectsRegistry } from '../domains/Project.js';
import type { ProjectLookup } from './MemoryWriter.js';

export interface ArchiveResult {
  archivedFiles: string[];
}

export class MemoryArchiver {
  constructor(
    private readonly projectLookup: ProjectLookup,
    private readonly workingDirectory = process.cwd()
  ) {}

  async archiveStale(
    registry: ProjectsRegistry,
    projectName: string,
    maxAgeDays: number
  ): Promise<ArchiveResult> {
    if (!Number.isFinite(maxAgeDays) || maxAgeDays < 0) {
      throw new Error('maxAgeDays must be a non-negative number');
    }

    const project = this.projectLookup.getProject(registry, projectName);
    const memoryRoot = this.getMemoryRoot(project);
    const filePaths = await glob('**/*.md', {
      cwd: memoryRoot,
      absolute: true
    });
    const archivedFiles: string[] = [];
    const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;

    for (const filePath of filePaths) {
      const fileStats = await stat(filePath);

      if (fileStats.mtimeMs >= cutoff) {
        continue;
      }

      const source = await readFile(filePath, 'utf8');
      const parsed = matter(source);

      if (parsed.data.archived === true) {
        continue;
      }

      await writeFile(
        filePath,
        matter.stringify(parsed.content, {
          ...parsed.data,
          archived: true
        }),
        'utf8'
      );
      archivedFiles.push(path.relative(memoryRoot, filePath));
    }

    return { archivedFiles };
  }

  private getMemoryRoot(project: ProjectConfig): string {
    return path.resolve(this.workingDirectory, project.memoryDir);
  }
}
