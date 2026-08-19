import { describe, expect, it } from 'vitest';
import { mkdtemp, mkdir, readFile, utimes, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { MemoryArchiver } from '../../src/writing/MemoryArchiver.js';
import { ProjectRegistry } from '../../src/config/ProjectRegistry.js';

describe('MemoryArchiver', () => {
  it('archives files older than the requested age', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'memory-archiver-'));
    const memoryRoot = path.join(root, 'memories');
    const filePath = path.join(memoryRoot, 'old.md');
    await mkdir(memoryRoot, { recursive: true });
    await writeFile(filePath, '---\ntype: decision\n---\n\nOld decision.\n');
    const oldDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    await utimes(filePath, oldDate, oldDate);

    const archiver = new MemoryArchiver(new ProjectRegistry('unused'), root);
    const result = await archiver.archiveStale(
      { projects: { demo: { memoryDir: 'memories' } } },
      'demo',
      5
    );

    expect(result.archivedFiles).toEqual(['old.md']);
    expect(await readFile(filePath, 'utf8')).toContain('archived: true');
  });
});
