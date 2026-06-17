import type { FilterOptions, RetrievedChunk } from './types.js';

export function filterChunk(
  chunk: RetrievedChunk,
  filters: FilterOptions
): boolean {
  return (
    matchesProject(chunk, filters.project) &&
    matchesType(chunk, filters.type) &&
    matchesTags(chunk, filters.tags) &&
    matchesPath(chunk, filters.path)
  );
}

function matchesPath(chunk: RetrievedChunk, path?: string): boolean {
  if (!path) {
    return true;
  }

  return chunk.metadata.filePath === path;
}

function matchesProject(chunk: RetrievedChunk, project?: string): boolean {
  if (!project) {
    return true;
  }

  return chunk.metadata.project === project;
}

function matchesTags(chunk: RetrievedChunk, tags?: string[]): boolean {
  if (!tags?.length) {
    return true;
  }

  return tags.every((tag) => chunk.metadata.tags.includes(tag));
}

function matchesType(chunk: RetrievedChunk, type?: string): boolean {
  if (!type) {
    return true;
  }

  return chunk.metadata.type === type;
}
