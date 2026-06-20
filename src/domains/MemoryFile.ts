export interface ParsedMemoryFile extends RawMemoryFile {
  metadata: Record<string, unknown>;
}

export interface RawMemoryFile extends MemoryFile {
  content: string;
}

export interface MemoryFile {
  project: string;

  absolutePath: string;

  relativePath: string;
}
