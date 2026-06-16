export interface MemoryMetadata {
  project: string;

  type?: string;

  title?: string;

  tags: string[];

  filePath: string;

  updatedAt?: string;
}

export interface MemoryDocument {
  content: string;

  metadata: MemoryMetadata;

  hash: string;

  updatedAt: string;
}
