export interface ParsedMemoryFile {
  project: string;

  absolutePath: string;

  relativePath: string;

  content: string;

  metadata: Record<string, unknown>;
}
