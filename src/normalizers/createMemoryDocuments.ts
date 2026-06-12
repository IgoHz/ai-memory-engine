import type { ParsedMemoryFile } from '../types/parsedMemoryFile.js';
import type { MemoryDocument, MemoryMetadata } from '../types/memory.js';

export function createMemoryDocuments(
  files: ParsedMemoryFile[]
): MemoryDocument[] {
  return files.map(createMemoryDocument);
}

function createMemoryDocument(file: ParsedMemoryFile): MemoryDocument {
  return {
    content: file.content,

    metadata: normalizeMetadata(file.project, file.relativePath, file.metadata)
  };
}

function normalizeMetadata(
  project: string,
  path: string,
  metadata: Record<string, unknown>
): MemoryMetadata {
  const type = typeof metadata.type === 'string' ? metadata.type : undefined;

  const title = typeof metadata.title === 'string' ? metadata.title : undefined;

  const tags = Array.isArray(metadata.tags)
    ? metadata.tags.filter((tag): tag is string => typeof tag === 'string')
    : [];

  return {
    project,
    path,
    type,
    title,
    tags
  };
}
