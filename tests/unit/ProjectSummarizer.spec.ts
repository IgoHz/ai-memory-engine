import { describe, expect, it } from 'vitest';
import { mkdtemp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { ProjectRegistry } from '../../src/config/ProjectRegistry.js';
import { ProjectSummarizer } from '../../src/writing/ProjectSummarizer.js';

describe('ProjectSummarizer', () => {
  it('writes a deterministic metadata summary file', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'project-summary-'));
    const memoryRoot = path.join(root, 'memories');
    await mkdir(memoryRoot, { recursive: true });
    await writeFile(
      path.join(memoryRoot, 'auth.md'),
      '---\ntitle: Authentication\ntype: decision\ntags: [security]\n---\n\nUse tokens.\n'
    );

    const summarizer = new ProjectSummarizer(new ProjectRegistry('unused'), root);
    const filePath = await summarizer.writeSummary(
      { projects: { demo: { memoryDir: 'memories' } } },
      'demo'
    );

    expect(path.basename(filePath)).toBe('project-summary.md');
    expect(await readFile(filePath, 'utf8')).toContain('Authentication (decision)');
    expect(await readdir(memoryRoot)).toContain('project-summary.md');
  });
});
