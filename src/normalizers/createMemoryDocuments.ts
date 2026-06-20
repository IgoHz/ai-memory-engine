import type { ParsedMemoryFile } from '../types/parsedMemoryFile.js';
import type { MemoryDocument, MemoryMetadata } from '../types/memory.js';
import { stat } from 'node:fs/promises';
import { indexerService } from '../indexing/IndexerService.js';

export async function createMemoryDocuments(
  files: ParsedMemoryFile[]
): Promise<MemoryDocument[]> {
  return Promise.all(files.map(createMemoryDocument));
}

async function createMemoryDocument(
  file: ParsedMemoryFile
): Promise<MemoryDocument> {
  const stats = await stat(file.absolutePath);

  return {
    content: file.content,

    metadata: normalizeMetadata(file.project, file.relativePath, file.metadata),

    hash: indexerService.calculateFileHash(file.content),

    updatedAt: stats.mtime.toISOString()
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
    filePath: path,
    type,
    title,
    tags
  };
}
