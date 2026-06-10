export interface MemoryMetadata {
  project: string;

  path: string;

  type?: string;

  title?: string;

  tags: string[];

  updatedAt?: string;
}

export interface MemoryDocument {
  content: string;

  metadata: MemoryMetadata;
}
