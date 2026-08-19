import { describe, expect, it } from 'vitest';
import { mkdtemp, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { MemoryWriter } from '../../src/writing/MemoryWriter.js';
import { ProjectRegistry } from '../../src/config/ProjectRegistry.js';

describe('MemoryWriter', () => {
  it('writes valid frontmatter and content inside the project directory', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'memory-writer-'));
    const registry = { projects: { demo: { memoryDir: 'memories' } } };
    const writer = new MemoryWriter(new ProjectRegistry('unused'), root);

    const filePath = await writer.write(registry, {
      project: 'demo',
      fileName: 'decisions/auth.md',
      type: 'decision',
      title: 'Authentication',
      tags: ['auth'],
      importance: 0.9,
      relatedTo: ['adr:authentication'],
      content: 'Use short-lived access tokens.'
    });

    expect(filePath).toBe(path.join(root, 'memories', 'decisions/auth.md'));
    expect(await readFile(filePath, 'utf8')).toContain('type: decision');
    expect(await readFile(filePath, 'utf8')).toContain('importance: 0.9');
    expect(await readFile(filePath, 'utf8')).toContain('adr:authentication');
    expect(await readFile(filePath, 'utf8')).toContain('Use short-lived access tokens.');
  });

  it('rejects paths outside the memory directory', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'memory-writer-'));
    const registry = { projects: { demo: { memoryDir: 'memories' } } };
    const writer = new MemoryWriter(new ProjectRegistry('unused'), root);

    await expect(writer.write(registry, {
      project: 'demo',
      fileName: '../escape.md',
      content: 'invalid'
    })).rejects.toThrow('inside the project memory directory');
  });
});
