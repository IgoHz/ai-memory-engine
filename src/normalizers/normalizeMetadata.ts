import type { MemoryMetadata } from '../types/memory.js';

export function normalizeMetadata(
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
