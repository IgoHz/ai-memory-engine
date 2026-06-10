import type { RawMemoryFile } from '../types/rawMemoryFile.js';
import type { ParsedMemoryFile } from '../types/parsedMemoryFile.js';
import { parseFrontmatter } from './parseFrontmatter.js';

export function parseFrontmatters(files: RawMemoryFile[]): ParsedMemoryFile[] {
  return files.map(parseFrontmatter);
}
