import type { ParsedMemoryFile } from '../domains/MemoryFile.js';
import type { MemoryDocument } from '../domains/MemoryDocument.js';
import { stat } from 'node:fs/promises';
import { MemoryMetadata } from '../domains/MemoryMetadata.js';
import { createHash } from 'node:crypto';

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

    metadata: normalizeMetadata(
      file.project,
      file.relativePath,
      file.metadata,
      stats.mtime.toISOString()
    ),

    sourcePath: file.absolutePath,

    hash: createHash('sha256').update(file.content).digest('hex'),

    updatedAt: stats.mtime.toISOString()
  };
}

function normalizeMetadata(
  project: string,
  path: string,
  metadata: Record<string, unknown>,
  updatedAt: string
): MemoryMetadata {
  const type = typeof metadata.type === 'string' ? metadata.type : undefined;

  const title = typeof metadata.title === 'string' ? metadata.title : undefined;

  const tags = Array.isArray(metadata.tags)
    ? metadata.tags.filter((tag): tag is string => typeof tag === 'string')
    : [];

  const importance = normalizeImportance(metadata.importance);
  const archived = metadata.archived === true;
  const relatedTo = Array.isArray(metadata.relatedTo)
    ? metadata.relatedTo.filter((value): value is string => typeof value === 'string')
    : [];

  return {
    project,
    filePath: path,
    type,
    title,
    tags,
    importance,
    archived,
    relatedTo,
    updatedAt
  };
}

function normalizeImportance(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0;
  }

  return Math.min(1, Math.max(0, value));
}
