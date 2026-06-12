import fs from 'node:fs/promises';
import type { MemoryFile } from '../types/file.js';
import type { RawMemoryFile } from '../types/rawMemoryFile.js';

export async function loadFiles(files: MemoryFile[]): Promise<RawMemoryFile[]> {
  return Promise.all(files.map(loadFile));
}

async function loadFile(file: MemoryFile): Promise<RawMemoryFile> {
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
