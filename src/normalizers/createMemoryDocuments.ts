import type { ParsedMemoryFile } from '../types/parsedMemoryFile.js';
import type { MemoryDocument } from '../types/memory.js';
import { createMemoryDocument } from './createMemoryDocument.js';

export function createMemoryDocuments(
  files: ParsedMemoryFile[]
): MemoryDocument[] {
  return files.map(createMemoryDocument);
}
