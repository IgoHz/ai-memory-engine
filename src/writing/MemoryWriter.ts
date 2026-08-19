import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import YAML from 'yaml';
import type { ProjectConfig, ProjectsRegistry } from '../domains/Project.js';
import { resolveProjectMemoryDir } from '../config/resolveProjectMemoryDir.js';

export interface MemoryWriteInput {
  project: string;
  fileName: string;
  content: string;
  type?: string;
  title?: string;
  tags?: string[];
  importance?: number;
  archived?: boolean;
  relatedTo?: string[];
}

export interface ProjectLookup {
  getProject(registry: ProjectsRegistry, projectName: string): ProjectConfig;
}

export class MemoryWriter {
  constructor(
    private readonly projectLookup: ProjectLookup,
    private readonly workingDirectory = process.cwd()
  ) {}

  async write(
    registry: ProjectsRegistry,
    input: MemoryWriteInput
  ): Promise<string> {
    const project = this.projectLookup.getProject(registry, input.project);
    const memoryRoot = resolveProjectMemoryDir(project, this.workingDirectory);
    const filePath = path.resolve(memoryRoot, input.fileName);

    if (!filePath.startsWith(`${memoryRoot}${path.sep}`) || !filePath.endsWith('.md')) {
      throw new Error('Memory file must be a Markdown file inside the project memory directory');
    }

    const metadata = {
      ...(input.type ? { type: input.type } : {}),
      ...(input.title ? { title: input.title } : {}),
      importance: Math.min(1, Math.max(0, input.importance ?? 0)),
      archived: input.archived ?? false,
      relatedTo: input.relatedTo ?? [],
      tags: input.tags ?? []
    };
    const document = `---\n${YAML.stringify(metadata)}---\n\n${input.content.trim()}\n`;

    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, document, 'utf8');

    return filePath;
  }
}
