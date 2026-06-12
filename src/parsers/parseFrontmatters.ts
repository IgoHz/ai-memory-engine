import matter from 'gray-matter';
import type { RawMemoryFile } from '../types/rawMemoryFile.js';
import type { ParsedMemoryFile } from '../types/parsedMemoryFile.js';

export function parseFrontmatters(files: RawMemoryFile[]): ParsedMemoryFile[] {
  return files.map(parseFrontmatter);
}

function parseFrontmatter(file: RawMemoryFile): ParsedMemoryFile {
  try {
    const parsed = matter(file.content);

    return {
      project: file.project,

      absolutePath: file.absolutePath,

      relativePath: file.relativePath,

      content: parsed.content,

      metadata: parsed.data
    };
  } catch (error) {
    throw new Error(`Failed to parse frontmatter in '${file.relativePath}'.`, {
      cause: error
    });
  }
}
