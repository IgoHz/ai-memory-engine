import type { ParsedMemoryFile } from '../types/parsedMemoryFile.js';
import type { MemoryDocument } from '../types/memory.js';
import { normalizeMetadata } from './normalizeMetadata.js';

export function createMemoryDocument(file: ParsedMemoryFile): MemoryDocument {
  return {
    content: file.content,

    metadata: normalizeMetadata(file.project, file.relativePath, file.metadata)
  };
}
