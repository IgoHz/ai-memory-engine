import path from 'node:path';
import { glob } from 'glob';
import matter from 'gray-matter';
import { readFile } from 'node:fs/promises';
import type { ProjectsRegistry } from '../domains/Project.js';
import type { ProjectLookup } from './MemoryWriter.js';
import { MemoryWriter } from './MemoryWriter.js';

export class ProjectSummarizer {
  constructor(
    private readonly projectLookup: ProjectLookup,
    private readonly workingDirectory = process.cwd()
  ) {}

  async writeSummary(registry: ProjectsRegistry, projectName: string): Promise<string> {
    const project = this.projectLookup.getProject(registry, projectName);
    const memoryRoot = path.resolve(this.workingDirectory, project.memoryDir);
    const filePaths = (await glob('**/*.md', { cwd: memoryRoot, absolute: true }))
      .filter((filePath) => path.basename(filePath) !== 'project-summary.md')
      .sort();
    const entries = await Promise.all(filePaths.map(async (filePath) => {
      const parsed = matter(await readFile(filePath, 'utf8'));
      const tags = Array.isArray(parsed.data.tags)
        ? parsed.data.tags.filter((tag): tag is string => typeof tag === 'string')
        : [];
      const type = typeof parsed.data.type === 'string' ? parsed.data.type : 'memory';
      const title = typeof parsed.data.title === 'string'
        ? parsed.data.title
        : path.basename(filePath, '.md');
      const archived = parsed.data.archived === true ? ' archived' : '';

      return `- ${title} (${type}${archived}) - ${path.relative(memoryRoot, filePath)}${tags.length ? ` [${tags.join(', ')}]` : ''}`;
    }));
    const content = [
      `# ${projectName} Memory Summary`,
      '',
      `Generated: ${new Date().toISOString()}`,
      '',
      `Memory files: ${entries.length}`,
      '',
      ...entries
    ].join('\n');
    const writer = new MemoryWriter(this.projectLookup, this.workingDirectory);

    return writer.write(registry, {
      project: projectName,
      fileName: 'project-summary.md',
      type: 'summary',
      title: `${projectName} Memory Summary`,
      importance: 0.5,
      content
    });
  }
}
