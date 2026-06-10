import type { MemoryFile } from '../types/file.js';
import type { RawMemoryFile } from '../types/rawMemoryFile.js';
import { loadFile } from './loadFile.js';

export async function loadFiles(files: MemoryFile[]): Promise<RawMemoryFile[]> {
  return Promise.all(files.map(loadFile));
}
