import { MemoryFile } from '../types/file';
import { ProjectsRegistry } from '../domains/Project';
import { projectRegistry } from '../config/ProjectRegistry.js';
import path from 'path';
import { glob } from 'glob';
import fs from 'fs/promises';
import { RawMemoryFile } from '../types/rawMemoryFile';

class FileLoader {
  async loadProjectFiles(
    registry: ProjectsRegistry,
    projectName: string
  ): Promise<RawMemoryFile[]> {
    const files = await this.discoverFiles(registry, projectName);

    return this.loadFiles(files);
  }

  private async discoverFiles(
    registry: ProjectsRegistry,
    projectName: string
  ): Promise<MemoryFile[]> {
    const project = projectRegistry.getProject(registry, projectName);

    const memoryRoot = path.join(project.root, project.memoryDir);

    const absolutePaths = await glob('**/*.md', {
      cwd: memoryRoot,
      absolute: true
    });

    absolutePaths.sort();

    return absolutePaths.map((absolutePath) => ({
      project: projectName,
      absolutePath,
      relativePath: path.relative(memoryRoot, absolutePath)
    }));
  }

  private async loadFiles(files: MemoryFile[]): Promise<RawMemoryFile[]> {
    return Promise.all(files.map(this.loadFile.bind(this)));
  }

  private async loadFile(file: MemoryFile): Promise<RawMemoryFile> {
    try {
      const content = await fs.readFile(file.absolutePath, 'utf-8');

      return {
        project: file.project,
        absolutePath: file.absolutePath,
        relativePath: file.relativePath,
        content
      };
    } catch (error) {
      throw new Error(
        `Failed to load file '${file.relativePath}' in project '${file.project}'.`,
        {
          cause: error
        }
      );
    }
  }
}

export const fileLoader = new FileLoader();
